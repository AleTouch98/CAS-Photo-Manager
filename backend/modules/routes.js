const{Router} = require('express');
const controller = require('./controller');

const router = Router();

router.get('/',(req,res)=>{
    res.send('Route di base');
});

router.get('/allutenti',controller.getUtenti);

module.exports = router;