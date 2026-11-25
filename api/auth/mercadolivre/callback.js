import {json} from '../../../lib/server.js';
export default function handler(req,res){return json(res,503,{status:'not_configured',message:'Rota reservada. OAuth ainda não habilitado. Nenhum código ou token será armazenado.'});}
