const expression = require('expression');
const { signup, login, becomeChef } = require('../controller/authController');
const auth = require('../middleware/auth');
const router = express.Router();


router.post('/signup',signup)

router.post('/login',login)

router.post('/become-chef',auth,becomeChef)

module.exports=router