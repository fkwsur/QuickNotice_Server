const {board, user, board_comment} = require('../models');
const {jwt} = require('../utils');


module.exports = {

  Write : async (req, res) => {
    try{
      let {
        group_idx,
        token,
        title,
        desc,
        notice
       } = req.body 
       let decoded = jwt.verifyToken(token);
       const rows = await user.findOne({where:{user_id: decoded.user_id}}) // 굳이 안쓰고 프론트에서 유저네임 세션에 저장해서 가져오면 되는데 그렇게 안짰으므로 임시로 이렇게 냅둠
       const rows2 = await board.create({
        title : title, 
        desc: desc,
        user_id : decoded.user_id, 
        visit_count : 0, 
        group_idx : group_idx, 
        notice : notice, 
        writer : rows.user_name 
      });
      if(rows2) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      // 에러핸들러외에 서비스 운영 중 버그 혹은 api에러 발생시 대응 할 수 있게 api위치와 error 내용을 담을 수 있는 로직이 있는게 좋음
      console.log(err);
      return res.status(200).send('에러가 났습니다.');
    }
  },

  BoardList : async (req, res) => {
    try{
      let { page } = req.query;
      let {
        group_idx
      } = req.body;
      let limit = 7;
      let offset = 0;
      if (page >1) {
        offset = (page -1) * limit
      }
      const rows = await board.findAndCountAll({
        limit: limit,
        offset : offset,
        where : {group_idx: group_idx},
        order: [["idx", "DESC"]]
      })
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  BoardNoticeList : async (req, res) => {
    try{
      let {
        group_idx
      } = req.body;
      const rows = await board.findAll({
        where : {group_idx: group_idx, notice : 'on'}
      })
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  BoardDetail : async (req, res) => {
    try{
      let {
        group_idx,
        idx
      } = req.body;
      const rows = await board.findOne({
        where : {idx : idx, group_idx: group_idx}
      })
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  BoardUpdate : async (req, res) => {
    try{
      let {
        token,
        title,
        desc,
        notice,
        idx
      } = req.body;
      let decoded = jwt.verifyToken(token);
      const rows = await board.update({
        title : title,
        desc : desc,
        notice : notice
      },
      {
        where : {idx : idx, user_id: decoded.user_id}
      })
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  BoardDelete : async (req, res) => {
    try{
      let {
        token,
        idx
      } = req.body;
      let decoded = jwt.verifyToken(token);
      const rows = await board.destroy({
        where : {idx : idx, user_id: decoded.user_id}
      })
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  WriteComment : async (req, res) => {
    try{
      let {
        token,
        idx,
        comment
      } = req.body;
      let decoded = jwt.verifyToken(token);
      const rows = await user.findOne({where:{user_id: decoded.user_id}}) // 굳이 안쓰고 프론트에서 유저네임 세션에 저장해서 가져오면 되는데 그렇게 안짰으므로 임시로 이렇게 냅둠
      if(!rows)  return res.status(200).json({result : '잘못된 데이터입니다.'});
      const rows2 = await board_comment.create({
        b_idx : idx, 
        user_id : decoded.user_id, 
        content : comment,
        writer : rows.user_name 
      });
      if(rows2) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  CommentList : async (req, res) => {
    try{
      let {
        idx
      } = req.body;
      const rows = await board_comment.findAll({
        where:{b_idx: idx}})
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },

  CommentUpdate : async (req, res) => {
    try{
      let {
        token,
        idx,
        content
      } = req.body;
      let decoded = jwt.verifyToken(token);
      const rows = await board_comment.update({
        content : content,
      },
      {
        where : {idx : idx, user_id : decoded.user_id}
      })
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },
  
  CommentDelete : async (req, res) => {
    try{
      let {
        token,
        idx
      } = req.body;
      let decoded = jwt.verifyToken(token);
      const rows = await board_comment.destroy({
        where : {idx : idx, user_id : decoded.user_id}
      })
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      return res.status(200).send('에러가 났습니다.');
    }
  },
}