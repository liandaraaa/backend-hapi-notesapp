import routes from './routes.js';
import UploadsHandler from './handler.js';

export default {
 name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
   const uploadsHandler = new UploadsHandler(service, validator);
    server.route(routes(uploadsHandler));
  },
};
