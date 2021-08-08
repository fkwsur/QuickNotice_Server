const {calendar, group_member, QueryTypes, sequelize, user} = require('../models');
const {jwt, fcm} = require('../utils');

module.exports = {
  
  CreateCalendar : async (req, res) => {
    try{
      let {
        title,
        token,
        category,
        category_color,
        desc,
        schedule,
        date,
        alarm,
        group_idx
      } = req.body
      let decoded = jwt.verifyToken(token);
      const rows = await calendar.create({
        title : title, 
        user_id : decoded.user_id, 
        category : category,
        color : category_color,
        content: desc,
        time : schedule,
        event_day : date,
        alarm : alarm,
        group_code : group_idx, 
      });
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  AllCalendar : async (req, res) => {
    try{
      let {token, group_idx} = req.body
      let decoded = jwt.verifyToken(token);
      let data = [decoded.user_id,group_idx];
      let query = `select * from group_member inner join calendar 
      on group_member.group_code = calendar.group_code 
      where group_member.member = ? and calendar.group_code = ?`;
      const rows = await sequelize.query(query, { replacements: data, type: QueryTypes.SELECT})
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  DetailCalendar : async (req, res) => {
    try{
      let {idx} = req.body
      const rows = await calendar.findOne({
        where : {
          idx : idx, 
        }
      })
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  UpdateCalendar : async (req, res) => {
    try{
      let {
        idx,
        title,
        token,
        category,
        category_color,
        desc,
        schedule,
        alarm,
        group_idx
      } = req.body
      let decoded = jwt.verifyToken(token);
      const rows = await calendar.update({
        title : title, 
        category : category,
        color : category_color,
        content: desc,
        time : schedule,
        alarm : alarm,
      },
      {where : {idx : idx, group_code : group_idx, user_id : decoded.user_id}
      });
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  DeleteCalendar : async (req, res) => {
    try{
      let {
        token,
        group_idx,
        idx
      } = req.body
      let decoded = jwt.verifyToken(token);
      const rows = await calendar.destroy({
        where : {idx : idx,  group_code : group_idx, user_id: decoded.user_id}
      })
      if(rows) return res.status(200).json({result : true});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  AlarmCard : async (req, res) => {
    try{
      let {
        token,
        group_idx
      } = req.body
      let decoded = jwt.verifyToken(token);
      let data = [decoded.user_id,group_idx, 'On'];
      let query = `select * from group_member inner join calendar
        on group_member.group_code = calendar.group_code
      where (calendar.event_day > curdate() or 
      ( calendar.event_day = curdate() and 
      calendar.time >= date_format(now(), '%H:%i'))) and group_member.member = ? and calendar.group_code = ? 
      and calendar.alarm = ? 
      order by calendar.event_day,calendar.time ASC`;
      const rows = await sequelize.query(query, { replacements: data, type: QueryTypes.SELECT})
      //console.log(rows);
      if(rows) return res.status(200).json({result : rows});
      else return res.status(200).json({error : '데이터가 올바르지 않습니다.'});
    }catch(err){
      console.log(err);
    }
  },

  FCM: async (req, res) => {
    try {
      let { title, message, push_token } = req.body;
      fcm.Send(title, message, push_token);
    } catch (error) {
      console.log(error);
    }
  },

}