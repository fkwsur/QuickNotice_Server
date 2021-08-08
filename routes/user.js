const router = require('express').Router();
const { userController: controller } = require('../controller');
const multer = require('multer');
const upload = multer({dest : './uploads'});

 router.post('/signup', controller.SignUp);
 router.post('/idcheck', controller.CheckId);
 router.post('/emailauth', controller.EmailAuth);
 router.post('/signin', controller.SignIn);
 router.post('/userinfo', controller.UserInfo);
 router.post('/memberinfo', controller.MemberInfo);
 router.post('/userimg', upload.single('image'),controller.EditProfileImg);
 
module.exports = router;