import app from './app';
import { ENV } from './config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`=======================================================`);
  console.log(`   🏥 VacantUp Healthcare Backend Server Running       `);
  console.log(`=======================================================`);
  console.log(`🚀 API Base URL:    http://localhost:${ENV.PORT}/api`);
  console.log(`❤️  Health check:   http://localhost:${ENV.PORT}/health`);
  console.log(`🔐 Mode:            ${ENV.NODE_ENV}`);
  console.log(`-------------------------------------------------------`);
  console.log(`Demonstration Accounts:`);
  console.log(` - Patient:         patient@vacantup.com   / Patient@123`);
  console.log(` - Doctor:          doctor@vacantup.com    / Doctor@123`);
  console.log(` - Hospital Admin:  hospital@vacantup.com  / Hospital@123`);
  console.log(` - Platform Admin:  admin@vacantup.com     / Admin@123`);
  console.log(`=======================================================`);
});

export default server;
