const {TransactionHandler} = require('sawtooth-sdk/processor/handler')
const {InternalError, InvalidTransaction} = require('sawtooth-sdk').exceptions;
const {decodeData, hash} = require('../lib/helper')
const cbor = require('cbor');

const {ORG_NAME,ORG_TYPE,VERSION,NAMESPACE} = require('../constants')

class UserHandler extends TransactionHandler
{
    constructor(){
        super(ORG_TYPE,[VERSION],NAMESPACE)
    }

    apply(transactionRequest, context)
    {
        return decodeData(transactionRequest.payload).then((payload)=>
        { 
            if(!payload.action){
                throw new InvalidTransaction("Payload doesn't contain an action")
            }
            if(!payload.data){
                throw new InvalidTransaction("Payload doesn't contain any data")
            }           

            let action = payload.action
            let data = payload.data

            switch(action)
            {
                case "create":
                    break;
                case "transfer":
                    break;
                case "vaccinate":
                    break;
            }


        }).catch((err)=>{

        });
    }
}
