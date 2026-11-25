import {guard,json} from '../lib/server.js';
export default function handler(req,res){if(!guard(req,res))return;json(res,200,{mode:'manual',mercadoLivre:'OAuth pendente de autorização e implementação',olist:'API pendente de autorização e implementação',execution:'disabled',database:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY)});}
