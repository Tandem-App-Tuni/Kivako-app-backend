let testEnvConfig = {
    hostname: process.env.ENV_URL,
    port: process.env.ENV_PORT || 443
  };
  
  module.exports = testEnvConfig;