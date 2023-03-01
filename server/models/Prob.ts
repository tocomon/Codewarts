import { Schema, model, Document, Model } from 'mongoose';
import { IProbInfo } from '../controllers/propTyes';
const mongoosePaginate = require('mongoose-paginate-v2');

const probdata = new Schema<IProbInfo>({
  probId: {
    type: Number,
  },
  prob_desc: {
    type: String,
  },
  prob_input: {
    type: String,
  },
  prob_output: {
    type: String,
  },
  samples: {
    type: Object,
  },
  source: {
    type: String,
  },
});

probdata.plugin(mongoosePaginate);

const Prob = model<IProbDocument>('prob', probdata);
// create new User document

export interface IProbDocument extends IProbInfo, Document {}
export interface IProbModel extends Model<IProbDocument> {}
export { probdata, Prob };
