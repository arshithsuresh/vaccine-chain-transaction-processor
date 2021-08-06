const {TransactionHandler} = require('sawtooth-sdk/processor/handler')
const {InternalError, InvalidTransaction} = require('sawtooth-sdk').exceptions;

const {decodeData, hash} = require('../lib/helper')
const MonitorModel = require('./monitordata')

const cbor = require('cbor');

const {ORG_NAME,ORG_TYPE,VERSION,NAMESPACE, FAMILY} = require('./vaccineConstant')

class VaccineHandler extends TransactionHandler
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
            const batchid = data.batchid            

            switch(action)
            {
                case "create":

                    const address = NAMESPACE[2] + hash(batchid).substring(0,64)

                    const vaccineData={
                        ...data,
                        manufacturer: ORG_NAME,
                        owner: data.manufacutureruser,
                        monitordata:[]
                    }

                    let entries = {
                        [address] : cbor.encode(vaccineData)
                    }

                    context.setState(entries)
                    break;

                case "transfer":
                    const vaccineAddress = data.vaccineAddress
                    const vaccineOwner = data.ownerAddress
                    const tranferAddress = data.transferAddress

                    context.getState([vaccineAddress]).then((addressValues)=>{
                        let stateValue = addressValues[vaccineAddress]

                        if(stateValue && stateValue.length)
                        {
                            let value = cbor.decodeFirstSync(stateValue);

                            const data = {
                                owner: tranferAddress
                            }
                            if( value['owner'] == vaccineOwner)
                            {
                                let entries ={
                                    [vaccineAddress] : cbor.encode(data)
                                }
                                context.setState(entries)
                            }
                            else
                            {
                                new InvalidTransaction("Invalid owner! You are not the owner!")
                            }
                        }
                    })
                    
                    break;
                case "monitor":
                    break;
                case "vaccinate":
                    break;
            }


        }).catch((err)=>{
            throw new InternalError("Error while decoding the payload \n"+err);
        });
    }
}

module.exports = VaccineHandler