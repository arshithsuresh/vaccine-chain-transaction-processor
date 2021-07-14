const{ TransactionProcessor } = require('sawtooth-sdk/processor')
const UserTranscationHandler = require('./userProcessor/userHandler')

const UserProcessor = new TransactionProcessor('tcp://localhost:4004') // Validator Address

const VaccineProcessor = new TransactionProcessor('tcp://localhost:4004') 

UserProcessor.addHandler(new UserTranscationHandler());
UserProcessor.start();

// VaccineProcessor.addHandler(new UserTranscationHandler());
// UserProcessor.start();

process.on('SIGUSR2', ()=>{
    UserProcessor._handleShutdown();
    //VaccineProcessor._handleShutdown();
})