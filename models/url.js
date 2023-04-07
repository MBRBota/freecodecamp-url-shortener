const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    original_url: {
        type: String,
        required: true
    }
});

urlSchema.plugin(AutoIncrement, { inc_field: 'short_url' });

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;