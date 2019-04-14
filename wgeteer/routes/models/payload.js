const mongoose = require('mongoose');

const payloadSchema = new mongoose.Schema({
    payload: {
        type: Buffer,
    },
    md5: {
        type: String,
        unique: true,
    },
    vt: {
        type: Object,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
},{timestamps:true},
);

module.exports = mongoose.model('Payload', payloadSchema);
 