const {user, group_collection,group_member, QueryTypes, sequelize} = require('../models');
const {jwt} = require('../utils');
const fs = require('fs');

module.exports = {

  CreateGroup : async (req, res) => {
    try{
      let {
        group_name,
        token
      } = req.body
      let decoded = jwt.verifyToken(token);
      const rows = await group_collection.create({
        group_name : group_name,
        manager : decoded.user_id
      })
      if(!rows) return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
      const rows2 = await group_member.create({
        group_code : rows.idx,
        member : decoded.user_id
      })
      if(rows2) return res.status(200).json({result : rows});
       else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  List : async (req, res) => {
    try{
      let {token} = req.body;
      let decoded = jwt.verifyToken(token);
      let data = [decoded.user_id];
      let query = `select * from group_collection inner join group_member 
      on group_collection.idx = group_member.group_code 
      where group_member.member = ?`;
      const rows = await sequelize.query(query, { replacements: data, type: QueryTypes.SELECT})
    if(rows) return res.status(200).json({result: rows});
    else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  GroupName : async (req, res) => {
    try{
      let {idx} = req.body;
      const rows = await group_collection.findOne({
        where : {idx : idx}
      })
      if(rows) return res.status(200).json({result : rows});
       else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },
    
  GroupList : async (req, res) => {
    try{
      let {
        group_idx
      } = req.body
      console.log(req.body);
      let data = [group_idx];
      let query = `select * from user inner join group_member 
      on user.user_id = group_member.member 
      where group_member.group_code = ?`;
      const rows = await sequelize.query(query, { replacements: data, type: QueryTypes.SELECT})
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  GroupCode : async (req, res) => {
    try{
      let {
        token,
        group_idx
      } = req.body; 
      let decoded = jwt.verifyToken(token);
      const rows = await group_collection.findOne({
        where : {
          idx : group_idx,
          manager : decoded.user_id
        }
      })
      if(!rows) return res.status(200).json({error : '매니저가 아닙니다.'});
      const now = new Date().toString().split("G")[0];
      const base64EncodedText = Buffer.from(now, "utf8").toString('base64');
      if(!rows.invite_code){
        const rows2 = await group_collection.update({
          invite_code : base64EncodedText
        },
        {
           where : {idx : group_idx}
         })
        if(rows2) return res.status(200).json({result : base64EncodedText});
        else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
      }else return res.status(200).json({result : rows.invite_code});
    }catch(err){
      console.log(err);
    }
  },

  JoinGroup : async (req, res) => {
    try {
      let {
        token,
        invite_code
      } = req.body; 
      let decoded = jwt.verifyToken(token);
      const rows = await group_collection.findOne({
        where : {
          invite_code : invite_code
        }
      })
      if(!rows) throw res.status(200).json({error : '존재하지 않는 그룹코드입니다.'});
      const rows2 = await group_member.findOne({
        where : {
          group_code : rows.idx, 
          member : decoded.user_id
        }
      })
      if(rows2) throw res.status(200).json({error : '이미 가입된 그룹입니다.'});
      const rows3 = await group_member.create({
      group_code : rows.idx, 
      member : decoded.user_id
      });
      if(rows3) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '가입에 실패했습니다.'});
    } catch (error) {
      console.log(error);
    }
  },

  EditGroupImg : async (req, res) => {
    try{
      let {
        token,
        group
      } = req.body;
      let decoded = jwt.verifyToken(token);
      let image = '/img/' + req.file.filename;
      const rows = await group_collection.findOne({
        where : {idx : group, manager : decoded.user_id}
      })
      console.log(rows.group_img);
      const rows2 = await group_collection.update({
        group_img : image,
      },
      {
          where : {manager : decoded.user_id, idx: group }
      })
      if(rows.group_img){
        const deleteImg = rows.group_img.split('/')[2]
        fs.unlink(`./uploads/${deleteImg}`,(err)=>{
          if (err) console.log(err);
          console.log('File deleted!');
        })
      }
      return res.status(200).json({result : image})
      }catch(err){
      console.log(err);
      }
    },

    NameUpdate : async (req, res) => {
      try{
        let {
          token,
          group,
          group_name
        } = req.body;
        console.log(req.body);
        let decoded = jwt.verifyToken(token);
        console.log(decoded)
        const rows = await group_collection.update({
          group_name : group_name,
        },
        {
            where : {manager : decoded.user_id, idx: group }
        })
        if(rows) {
          const rows2 = await group_collection.findOne({
            where : {idx : group}
          })
          console.log(rows2);
          return res.status(200).json({result : rows2});
        }
        else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
        }catch(err){
        console.log(err);
        }
      },

    DeleteGroup : async (req, res) => {
      try{
        let {
          token,
          group
        } = req.body;
        console.log(req.body);
        let decoded = jwt.verifyToken(token);
        console.log(decoded)
        const rows = await group_collection.destroy({
            where : {idx: group, manager : decoded.user_id  }
        })
        if(rows) return res.status(200).json({result : true});
        else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
        }catch(err){
        console.log(err);
        }
      },

}