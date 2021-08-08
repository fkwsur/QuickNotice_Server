const router = require('express').Router();
const { groupController: controller } = require('../controller');
const multer = require('multer');
const upload = multer({dest : './uploads'});

 router.post('/create', controller.CreateGroup);
 router.post('/list', controller.List);
 router.post('/GroupName', controller.GroupName);
 router.post('/grouplist', controller.GroupList);
 router.post('/groupcode', controller.GroupCode);
 router.post('/joingroup', controller.JoinGroup);
 router.post('/groupimg', upload.single('image'),controller.EditGroupImg);
 router.post('/NameUpdate', controller.NameUpdate);
 router.post('/DeleteGroup', controller.DeleteGroup);

module.exports = router;