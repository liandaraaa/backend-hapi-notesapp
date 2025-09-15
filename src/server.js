import dotenv from 'dotenv';

import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';

import NotesValidator from './validator/notes/index.js';
import NotesService from './services/postgres/NotesService.js';
import notes from './api/notes/index.js';

import UsersValidator from './validator/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import users from './api/users/index.js';

import authentications from './api/authentications/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import AuthenticationsValidator from './validator/authentications/index.js';

import collaborations from './api/collaborations/index.js';
import CollaborationsService from './services/postgres/CollaborationsService.js';
import CollaborationsValidator from './validator/collaborations/index.js';

import ExportsValidator from './validator/exports/index.js';
import ProducerService from './services/rabbitmq/ProducerService.js';
import _exports from './api/exports/index.js';

import TokenManager from './tokenize/TokenManager.js';

import ClientError from './exceptions/ClientError.js';

dotenv.config();

const init = async () => {
   const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

   server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
