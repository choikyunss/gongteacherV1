const express = require('express');

const app = express();

var mysql = require('mysql');
var conn = mysql.createConnection({
    host : 'kyunss-db.cjwyxnwnqovj.ap-northeast-2.rds.amazonaws.com',
    user : 'kyunss_admin',
    password : 'Choibjk6014#',
    database : 'Gong_Teacher'
});

//conn.connect();

const server = app.listen(3001, () => {
    console.log('Start Server : 13.124.234.170:3001');

});


// body-parser 불러오기
var bodyParser = require('body-parser');

// body-parser 가 클라이언트에서 오는 정보를 서버에서 분석 후 가져오게 하는데 1. 인코딩된 url을 가져오는 방법, 2. json 타입으로 된 것을 가져오는 방법 두 가지 모두 가져올 수 있도록 합니다.
app.use(bodyParser.urlencoded({ extended: true,}));
app.use(bodyParser.json()); 



// 콜론이 있으면 어떤값이든 들어올수 있다는 의미임
// app.get('/api/users/:type', async(req, res) => {
//     res.send('connect.');
// });
//


///////////// 테이블의 모든 데이터 불러오기 ///////////////////////////
// app.get('/api/users/:type', async(req, res) => {
//     let {type} = req.params;
//     console.log(type);
//     conn.query('SELECT * FROM users;', function(err, rows, fields) {
//         if (err) {
//             res.send(err);
//         } else {
//             res.send(rows);
//         }
//     });
// });



///////////// 특정 테이블 데이터를 모두 가져와서 특정 key 값만 출력하기 /////////////
/*
var sql = 'SELECT * FROM topic';
conn.query(sql, function(err, rows, fields) {
    if(err) {
        console.log(err);
    } else {
        for(var i=0; i<rows.length; i++) {
            console.log(rows[i].author);
        }
    }
});
*/



///////////// customer_id를 지정해서 특정 row 데이터 불러오기 ///////////////////////////
/*
app.get('/api/users/cid/:type', async(req, res) => {
    let {type} = req.params;
    console.log(type);
    
    // customer_id를 지정해서 id 가져오고, 그 아이디를 이용해서 특정 row 데이터 가져오기
    conn.query('SELECT id FROM users WHERE customer_id = ?;', type, function(err1, rows1, fields) {
        if (err1) {
            console.log(err1);
        } else {
            console.log(rows1);
            let data_id = rows1[0].id;
            
            conn.query('SELECT * FROM users WHERE id = ?;', data_id, function(err2, rows2, fields) {
                if (err2) {
                    res.send(err2);
                } else {
                    res.send(rows2);
                }
            });
        }
    });
});
*/
    


///////////// 사용자 신규가입 (DB : Users) /////////////////////////// (2022.08.19)
/*
app.post('/api/users/add', function(req, res) {
    var req_body = req.body;
    console.log(req_body);
    var nickname = req.body.nickname.toString();
    var email = req.body.email.toString();
    var join_date = req.body.join_date.toString();
    var level = 1; // 신규 가입자의 학습레벨은 무조건 1
    var app_version = req.body.app_version;
    var c_login_date = req.body.c_login_date.toString();
    var p_login_date = req.body.p_login_date.toString();    

    var sql = 'INSERT INTO users (nickname, email, join_date, app_version, c_login_date, p_login_date) VALUES (?, ?, ?, ?, ?, ?)';
    conn.query(sql, [nickname, email, join_date, level, app_version, c_login_date, p_login_date], (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});
*/

///////////// 사용자 신규가입 (DB : Users) ///////////////////////////
app.post('/api/users/add', function(req, res) {
    var req_body = req.body;
    console.log(req_body);
    var nickname = req.body.nickname.toString();
    var email = req.body.email.toString();
    var join_date = req.body.join_date.toString();
    var level = req.body.level;
    var app_version = req.body.app_version;
    var c_login_date = req.body.c_login_date.toString();
    var p_login_date = req.body.p_login_date.toString();    

    var sql = 'INSERT INTO users (nickname, email, join_date, level, app_version, c_login_date, p_login_date) VALUES (?, ?, ?, ?, ?, ?, ?) WHERE NOT EXISTS (SELECT * FROM users WHERE email = VALUES (email))';
    // 신규 가입자의 E-Mail이 중복될 경우, 중복가입처리 되지 않도록 함
    conn.query(sql, [nickname, email, join_date, level, app_version, c_login_date, p_login_date], (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});


///////////// users DB에 값 수정하기 ///////////////////////////
app.put('/api/users/update/:type', function(req, res) {
    let {type} = req.params;
    var last_login_date = req.body.last_login_date.toString();
    var user_version = req.body.user_version;
    var level = req.body.level;
    
    var sql = 'UPDATE users SET last_login_date=?, user_version=?, level=? WHERE id=?';
    var params = [last_login_date, user_version, level, type]
    conn.query(sql, params, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});



///////////// id를 지정해서 users 테이블의 특정 row 데이터 불러오기 ///////////////////////////
app.get('/api/users/read/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('SELECT * FROM users WHERE id = ?;', type, function(err, rows, fields) {
        if (err) {
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});




///////////// id를 지정해서 users 테이블의 특정 row 삭제하기 ///////////////////////////
app.delete('/api/users/delete/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('DELETE FROM users WHERE id = ?;', type, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});





//////////////////////////////////////////////////////////////////
//////////////// O X /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

////////////////// s_db_ox_1_1_user_correct_month1 

/////// user 생성
app.post('/api/ox_1_1_user_correct_month1/add', function(req, res) {
    var req_body = req.body;
    console.log(req_body);
    var user_number = req.body.user_number;
    var level = 1

    var sql = 'INSERT INTO s_db_ox_1_1_user_correct_month1 (user_number, level) VALUES (?, ?)';
    conn.query(sql, [user_number, level], (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});



/////// 문제 맞음
app.put('/api/ox_1_1_user_correct_month1/update/:user_id', function(req, res) {
    
    let {user_id} = req.params;
    var question_num = req.body.question_num;
    
    var sql = 'SELECT ?? FROM s_db_ox_1_1_user_correct_month1 WHERE user_number = ?';
    var params = [question_num, user_id]
    conn.query(sql, params, function(err, rows, fields) {
        if (err) {
            res.send(err);
        } else {
            console.log(rows);
            var old_data_kv = Object.values(rows[0]);
            var old_data = old_data_kv[0]
            if (!old_data) {
                var new_data = 1;
                console.log("null");
            } else {
                var new_data = old_data + 1;
                console.log(new_data);
                console.log("none null");
            }
            
            console.log(new_data);
            var sql = 'UPDATE s_db_ox_1_1_user_correct_month1 SET ?? = ? WHERE user_number=?';
            var params = [question_num, new_data, user_id]
            conn.query(sql, params, function(err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log(rows);
                    res.send(rows);
                }
            });
        }
    });
});












//////////////////////////////////////////////////////////////////////
// 특정시간 예약 이벤트 (node-schedule)
//////////////////////////////////////////////////////////////////////


const schedule = require('node-schedule');

const j = schedule.scheduleJob('10 * * * * *', function() {
    console.log("매 10초마다 실행");
});















//conn.end();