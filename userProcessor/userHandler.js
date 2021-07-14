const {TransactionHandler} = require('sawtooth-sdk/processor/handler')
const {InternalError, InvalidTransaction} = require('sawtooth-sdk').exceptions;
const {decodeData, hash} = require('../lib/helper')
const cbor = require('cbor');

const {ORG_NAME,ORG_TYPE,FAMILY,VERSION,NAMESPACE} = require('../constants')

class UserHandler extends TransactionHandler
{
    constructor(){
        super(FAMILY,[VERSION],NAMESPACE)
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
                    let userid = payload.data.userid
                    let publickey = payload.data.publickey
                    let name = payload.data.name
                    let organizationName = ORG_NAME
                    let org_type = ORG_TYPE 
                    let UserAddress = NAMESPACE[2] + hash(userid).substring(0,64)

                    let userData = {
                        userid:userid,
                        publickey:publickey,
                        name:name,
                        orgname:organizationName,
                        orgtype:org_type
                    }
                    
                    let entries = {
                        [UserAddress]: cbor.encode(userData)
                    }

                    context.setState(entries)

                break;                
                default:
                    throw new InvalidTransaction("Action is not supported by this transcation processor: action :"+action)
            }           

        })
        .catch((err)=>{
            throw new InternalError("Error while decoding the payload \n"+err);
        })
    }
}

module.exports = UserHandler

