const {TransactionHandler} = require('sawtooth-sdk/processor/handler')
const {InternalError, InvalidTransaction} = require('sawtooth-sdk').exceptions;
const {decodeData, hash} = require('../lib/helper')
const cbor = require('cbor');

const {ORG_NAME,ORG_TYPE,FAMILY,VERSION,NAMESPACE,USER_PREFIX} = require('./userConstant')

const _display = msg => {
    let n = msg.search('\n')
    let length = 0
  
    if (n !== -1) {
      msg = msg.split('\n')
      for (let i = 0; i < msg.length; i++) {
        if (msg[i].length > length) {
          length = msg[i].length
        }
      }
    } else {
      length = msg.length
      msg = [msg]
    }
  
    console.log('+' + '-'.repeat(length + 2) + '+')
    for (let i = 0; i < msg.length; i++) {
      let len = length - msg[i].length
  
      if (len % 2 === 1) {
        console.log(
          '+ ' +
            ' '.repeat(Math.floor(len / 2)) +
            msg[i] +
            ' '.repeat(Math.floor(len / 2 + 1)) +
            ' +'
        )
      } else {
        console.log(
          '+ ' +
            ' '.repeat(Math.floor(len / 2)) +
            msg[i] +
            ' '.repeat(Math.floor(len / 2)) +
            ' +'
        )
      }
    }
    console.log('+' + '-'.repeat(length + 2) + '+')
  }

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
                throw new InvalidTransaction("User Handler: Payload doesn't contain an action")
            }
            if(!payload.data){
                throw new InvalidTransaction("User Handler: Payload doesn't contain any data")
            }           

            let action = payload.action
            let data = payload.data

            const userid = payload.data.userid;

            let entries={}
            let userData={}
            let address;

            switch(action)
            {
                case "create":

                    let UserAddress = NAMESPACE[2] + hash(userid).substring(0,64)
                    _display("Creating user : ")
                    _display(UserAddress)
                    userData = {
                        userid: data.userid,
                        publickey: data.publickey,
                        name: data.name,
                        orgname: ORG_NAME,
                        orgtype: ORG_TYPE
                    }
                    _display("Creating user Data: ")
                    _display(JSON.stringify(userData))
                    entries = {
                        [UserAddress]: cbor.encode(userData)
                    }

                    return context.setState(entries)

                break;
                case "vaccinate":     

                    address = USER_PREFIX+hash(userid).substring(0,64)
                    const vaccineOwner = data.vaccinatorAddress

                    context.getState([address]).then((addressValue)=>{
                        let stateValue = addressValue[address]

                        if(stateValue && stateValue.length)
                        {
                            let value = cbor.decodeFirstSync(stateValue)

                            if(value['owner'] == vaccineOwner)
                            {                            
                                if(value['vaccineDOSE1'] == null)
                                {
                                    const data = {  
                                        ...value,
                                        vaccineDOSE1:data.vaccinedata
                                    }
                                    entries = {                                    
                                        [address] : cbor.encode(vaccineDOSE1)
                                    };

                                    return context.setState(entries)

                                }
                                else
                                {
                                    const data = {  
                                        ...value,
                                        vaccineDOSE2:data.vaccinedata
                                    }
                                    entries = {                                    
                                        [address] : cbor.encode(vaccineDOSE1)
                                    };

                                    return context.setState(entries)
                                }
                            }
                            throw new InvalidTransaction("User Handler: Invalid Owner")
                    }           

                        })             

                break;
                case "createpublic":
                    
                    
                    userData = {
                        userid : data.userid,
                        publickey : data.publickey,
                        name: data.name,
                        dob: data.dob,
                        aadhar:  data.aadhar,
                        passport: data.passport,                        
                        vaccineDOSE1:null,
                        vaccineDOSE2:null
                    }

                    let userAddress = USER_PREFIX+hash(userid).substring(0,64)
                    _display("Creating Public User : ")
                    _display(userAddress)
                    _display(JSON.stringify(userData))

                    entries = {
                        [userAddress]:cbor.encode(userData)
                    }

                    return context.setState(entries)
                break;               
                default:
                    throw new InvalidTransaction("User Handler: Action is not supported by this transcation processor: action :"+action)
            }           

        })
        .catch((err)=>{
            throw new InternalError("User Handler: Error while decoding the payload \n"+err);
        })
    }
}

module.exports = UserHandler

