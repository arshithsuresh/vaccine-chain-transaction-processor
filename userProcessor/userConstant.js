require('dotenv').config()
const {hash} = require('../lib/helper')

const ORG_NAME = process.env.ORG_NAME
const ORG_TYPE = process.env.ORG_TYPE
const FAMILY = process.env.USER_FAM

const VERSION = '1.0'
const NAMESPACE = [ORG_TYPE,FAMILY, hash(ORG_NAME).substr(0,6)]
const USER_PREFIX= hash('publicuser').substr(0,6)

module.exports = {
    ORG_NAME,
    ORG_TYPE,
    VERSION,
    NAMESPACE,
    FAMILY,
    USER_PREFIX
}