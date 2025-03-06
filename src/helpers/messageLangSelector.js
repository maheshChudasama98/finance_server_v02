const { ENGLISH, GUJARATI } = require('../api/constants/messages')

function getMessage(lang, message) {
    if (lang == 'GJ') {
        return GUJARATI[message];
    } else {
        return ENGLISH[message];
    }
}
module.exports = { getMessage };