const express = require('express');

const app = express();

// Mysql2 Module 사용
var mysql = require('mysql');
//var mysql = require('mysql2/promise');

/* ********** Make transaction object ********** */
/*
var transaction = require('node-mysql-transaction');
var trconn = transaction({
    // mysql connection config
    connection: [mysql.createConnection,{
        host : 'kyunss-db.cjwyxnwnqovj.ap-northeast-2.rds.amazonaws.com',
        user : 'kyunss_admin',
        password : 'Choibjk6014#',
        database : 'Gong_Teacher'
    }],

    // create temporary connection for increased volume of async work.
    // if request queue became empty,
    // start soft removing process of the connection.
    // recommended for normal usage.
    dynamicConnection: 32,

    // set dynamicConnection soft removing time.
    idleConnectionCutoffTime: 1000,

    // auto timeout rollback time in ms
    // turn off is 0
    timeout: 600
});
*/

var conn = mysql.createConnection({
    host : 'kyunss-db.cjwyxnwnqovj.ap-northeast-2.rds.amazonaws.com',
    user : 'kyunss_admin',
    password : 'Choibjk6014#',
    database : 'Gong_Teacher'
});

//conn.connect();

const server = app.listen(3001, () => {
    console.log('Start Server : 13.124.19.61:3001');

});


// body-parser 불러오기
var bodyParser = require('body-parser');

// body-parser 가 클라이언트에서 오는 정보를 서버에서 분석 후 가져오게 하는데 1. 인코딩된 url을 가져오는 방법, 2. json 타입으로 된 것을 가져오는 방법 두 가지 모두 가져올 수 있도록 합니다.
app.use(bodyParser.urlencoded({ extended: true,}));
app.use(bodyParser.json());

// Date Object 생성
function getFormatDate(date){
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    var day = date.getDate();
    day = day >= 10 ? day : '0' + day;

    return year + "-" + month + "-" + day;
}

var date = getFormatDate(new Date());
console.log(date);

///////////// (Table ID : s_users_id_info) 사용자 신규 추가 ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/add
// ** Body(JSON) : { "login_id": (VARCHAR), "email": (VARCHAR), "join_route": (VARCHAR), "app_version": (INT), "terms_accept": 0/1 (BIT), "ad_accept": 0/1 (BIT)  }
/// TODO : 동일 이메일 가입 시도 시, 체크하여 중복가입 막기 -> 적용 해야함.//
app.post('/api/s_users_id_info/add', function(req, res) {
    var req_body = req.body;
    console.log(req_body);

    var login_id = req.body.login_id.toString(); // 로그인 ID (Primary Key) //
    var email = req.body.email.toString(); // E-Mail 주소 //
    var join_route = req.body.join_route.toString(); // 가입 경로 (Naver, Kakao Talk, Google)
    var join_date = date.toString(); // 최초 가입 날짜 //
    var level = 1; // 신규 가입자의 학습레벨은 무조건 1단계 //
    var app_version = req.body.app_version; // 앱 버전 //
    var terms_accept = req.body.terms_accept; // 이용약관 동의 여부 //
    var ad_accept = req.body.ad_accept; // 광고 수신 동의 여부 //
    
    var sql = 'INSERT INTO s_users_id_info (login_id, email, join_route, join_date, level, app_version, c_login_date, p_login_date, terms_accept, ad_accept)'
            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [login_id, email, join_route, join_date, level, app_version, join_date, join_date, terms_accept, ad_accept], (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_users_id_info) 사용자 정보 불러오기 (join_route, join_date, c_login_date, p_login_date, terms_accept, ad_accept) ///////////////////////////
app.get('/api/s_users_id_info/read/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('SELECT user_id, join_route, join_date, c_login_date, p_login_date, terms_accept, ad_accept FROM s_users_id_info WHERE login_id = ?;', type, function(err, rows, fields) {
        if (err) {
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_users_id_info) 사용자 정보 업데이트 (app_version, c_login_date, p_login_date) ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/update1/:type (type : login_id)
// ** Body(JSON) : { "app_version": (INT) }
app.put('/api/s_users_id_info/update1/:type', function(req, res) {
    let {type} = req.params;
    var app_version = req.body.app_version;
    var c_login_date = date.toString();

    conn.query('SELECT c_login_date FROM s_users_id_info WHERE login_id = ?;', type, function(err1, rows1, fields) {
        if (err1) {
            res.send(err1);
        } else {
            console.log(rows1.c_login_date);
            var p_login_date = rows1[0].c_login_date;
            var sql = 'UPDATE s_users_id_info SET app_version=?, c_login_date=?, p_login_date=? WHERE login_id=?';
            var params = [app_version, c_login_date, p_login_date, type]
            conn.query(sql, params, function(err2, rows2, fields) {
                if (err2) {
                    console.log(err2);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log(rows2);
                    res.send(rows2);
                }
            });
        }
    });
});

///////////// (Table ID : s_users_id_info) 사용자 정보 업데이트 (약관 및 광고수신 동의 여부) ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/update2/:type (type : login_id)
// ** Body(JSON) : { "terms_accept": 0/1 (BIT), "ad_accept": 0/1 (BIT)  }
app.put('/api/s_users_id_info/update2/:type', function(req, res) {
    let {type} = req.params;
    var terms_accept = req.body.terms_accept;
    var ad_accept = req.body.ad_accept;

    var sql = 'UPDATE s_users_id_info SET terms_accept=?, ad_accept=? WHERE login_id=?';
    var params = [terms_accept, ad_accept, type]
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

///////////// (Table ID : s_system_id_info) 시스템 정보 불러오기 (final_ver, mandatory_update_ver, maint_period) ///////////////////////////
app.get('/api/s_system_id_info/read/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('SELECT final_ver, mandatory_update_ver, maint_period FROM s_system_id_info WHERE system_id = ?;', type, function(err, rows, fields) {
        if (err) {
            res.send(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_ox_users_order_ch01~12) Read OX order ///////////////////////////
function read_ox_order() {
    ///////////// OX Chapter-1 /////////////
    app.get('/api/s_ox_users_order_ch01/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch01 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-2 /////////////
    app.get('/api/s_ox_users_order_ch02/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch02 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-3 /////////////
    app.get('/api/s_ox_users_order_ch03/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch03 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-4 /////////////
    app.get('/api/s_ox_users_order_ch04/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch04 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-5 /////////////
    app.get('/api/s_ox_users_order_ch05/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch05 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-6 /////////////
    app.get('/api/s_ox_users_order_ch06/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch06 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-7 /////////////
    app.get('/api/s_ox_users_order_ch07/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch07 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-8 /////////////
    app.get('/api/s_ox_users_order_ch08/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch08 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-9 /////////////
    app.get('/api/s_ox_users_order_ch09/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch09 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-10 /////////////
    app.get('/api/s_ox_users_order_ch010/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch010 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-11 /////////////
    app.get('/api/s_ox_users_order_ch011/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch011 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-12 /////////////
    app.get('/api/s_ox_users_order_ch012/read/:type', async(req, res) => {

        let {type} = req.params;

        conn.query('SELECT * FROM s_ox_users_order_ch012 WHERE user_id = ?;', type, function(err, rows, fields) {
            if (err) {
                res.send(err);
            } else {
                res.send(rows);
            }
        });
    });
}
read_ox_order()

///////////// (Table ID : s_ox_users_order_ch01~12) Update OX ///////////////////////////
// ** Sequence 
// 1 Step : update OX order table 0 to 5
// 2 Step : update OX solve result table 0 or 1 (1 is collect answer, 0 is wrong answer) 
// 3 Step : update OX learning volume table by counting the number of times learned
// ** URL : http://13.124.19.61:3001/api/s_ox_users_order_ch01/update/:type (type : user_id )
// ** Body(JSON) : { "q_num": 1 ~ n (INT), "order_t": 1 ~ 5 (INT), "solve_r": 0/1 (BIT) }
function update_ox() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_order_ch01/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch01_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch01"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch01 ' +
                    'JOIN s_ox_users_s2_ch01 ON s_ox_users_s2_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
                    'JOIN s_ox_users_s3_ch01 ON s_ox_users_s3_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
                    'JOIN s_ox_users_s4_ch01 ON s_ox_users_s4_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
                    'JOIN s_ox_users_s5_ch01 ON s_ox_users_s5_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch01.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch01 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-2 /////////////
    app.put('/api/s_ox_users_order_ch02/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch02_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch02"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch02 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch02 ' +
                    'JOIN s_ox_users_s2_ch02 ON s_ox_users_s2_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
                    'JOIN s_ox_users_s3_ch02 ON s_ox_users_s3_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
                    'JOIN s_ox_users_s4_ch02 ON s_ox_users_s4_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
                    'JOIN s_ox_users_s5_ch02 ON s_ox_users_s5_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch02.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch02 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-3 /////////////
    app.put('/api/s_ox_users_order_ch03/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch03_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch03"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch03 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch03 ' +
                    'JOIN s_ox_users_s2_ch03 ON s_ox_users_s2_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
                    'JOIN s_ox_users_s3_ch03 ON s_ox_users_s3_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
                    'JOIN s_ox_users_s4_ch03 ON s_ox_users_s4_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
                    'JOIN s_ox_users_s5_ch03 ON s_ox_users_s5_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch03.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch03 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-4 /////////////
    app.put('/api/s_ox_users_order_ch04/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch04_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch04"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch04 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch04 ' +
                    'JOIN s_ox_users_s2_ch04 ON s_ox_users_s2_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
                    'JOIN s_ox_users_s3_ch04 ON s_ox_users_s3_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
                    'JOIN s_ox_users_s4_ch04 ON s_ox_users_s4_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
                    'JOIN s_ox_users_s5_ch04 ON s_ox_users_s5_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch04.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch04 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-5 /////////////
    app.put('/api/s_ox_users_order_ch05/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch05_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch05"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch05 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch05 ' +
                    'JOIN s_ox_users_s2_ch05 ON s_ox_users_s2_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
                    'JOIN s_ox_users_s3_ch05 ON s_ox_users_s3_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
                    'JOIN s_ox_users_s4_ch05 ON s_ox_users_s4_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
                    'JOIN s_ox_users_s5_ch05 ON s_ox_users_s5_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch05.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch05 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-6 /////////////
    app.put('/api/s_ox_users_order_ch06/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch06_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch06"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch06 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch06 ' +
                    'JOIN s_ox_users_s2_ch06 ON s_ox_users_s2_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
                    'JOIN s_ox_users_s3_ch06 ON s_ox_users_s3_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
                    'JOIN s_ox_users_s4_ch06 ON s_ox_users_s4_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
                    'JOIN s_ox_users_s5_ch06 ON s_ox_users_s5_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch06.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch06 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-7 /////////////
    app.put('/api/s_ox_users_order_ch07/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch07_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch07"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch07 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch07 ' +
                    'JOIN s_ox_users_s2_ch07 ON s_ox_users_s2_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
                    'JOIN s_ox_users_s3_ch07 ON s_ox_users_s3_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
                    'JOIN s_ox_users_s4_ch07 ON s_ox_users_s4_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
                    'JOIN s_ox_users_s5_ch07 ON s_ox_users_s5_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch07.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch07 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-8 /////////////
    app.put('/api/s_ox_users_order_ch08/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch08_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch08"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch08 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch08 ' +
                    'JOIN s_ox_users_s2_ch08 ON s_ox_users_s2_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
                    'JOIN s_ox_users_s3_ch08 ON s_ox_users_s3_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
                    'JOIN s_ox_users_s4_ch08 ON s_ox_users_s4_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
                    'JOIN s_ox_users_s5_ch08 ON s_ox_users_s5_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch08.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch08 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-9 /////////////
    app.put('/api/s_ox_users_order_ch09/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch09_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch09"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch09 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch09 ' +
                    'JOIN s_ox_users_s2_ch09 ON s_ox_users_s2_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
                    'JOIN s_ox_users_s3_ch09 ON s_ox_users_s3_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
                    'JOIN s_ox_users_s4_ch09 ON s_ox_users_s4_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
                    'JOIN s_ox_users_s5_ch09 ON s_ox_users_s5_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch09.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch09 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-10 /////////////
    app.put('/api/s_ox_users_order_ch10/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch10_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch10"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch10 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch10 ' +
                    'JOIN s_ox_users_s2_ch10 ON s_ox_users_s2_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
                    'JOIN s_ox_users_s3_ch10 ON s_ox_users_s3_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
                    'JOIN s_ox_users_s4_ch10 ON s_ox_users_s4_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
                    'JOIN s_ox_users_s5_ch10 ON s_ox_users_s5_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch10.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch10 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-11 /////////////
    app.put('/api/s_ox_users_order_ch11/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch11_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch11"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch11 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch11 ' +
                    'JOIN s_ox_users_s2_ch11 ON s_ox_users_s2_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
                    'JOIN s_ox_users_s3_ch11 ON s_ox_users_s3_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
                    'JOIN s_ox_users_s4_ch11 ON s_ox_users_s4_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
                    'JOIN s_ox_users_s5_ch11 ON s_ox_users_s5_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch11.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch11 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    ///////////// OX Chapter-12 /////////////
    app.put('/api/s_ox_users_order_ch12/update/:type', function(req, res) {
        conn.beginTransaction((err)=>{
            let {type} = req.params;
            var q_num = req.body.q_num; // 문항 번호 (Input value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t; // Order info.에 따른 table ID 선택 (Input value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r; // 풀이 결과값 (Input value : 1 / 0)
            var qst_string = "ox_ch12_q" + q_num; // 문항 번호 String
            var t_string = "s_ox_users_s" + order_t + "_ch12"; // Table ID String

            let today = new Date();
            let year = today.getFullYear(); // 연도
            let month = today.getMonth() + 1; // 월
            var date_string = year + "_" + month; // Date String

            var sql1 = 'UPDATE s_ox_users_order_ch12 SET ??=??%5+1 WHERE user_id=?';
            var params1 = [qst_string, qst_string, type]
            conn.query(sql1, params1, function(err1, rows1, fields) {
                if (err1) {
                    console.log(err1);
                    res.status(500).send('Internal Server Error');
                } else {
                    var sql2 = 'UPDATE s_ox_users_s1_ch12 ' +
                    'JOIN s_ox_users_s2_ch12 ON s_ox_users_s2_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
                    'JOIN s_ox_users_s3_ch12 ON s_ox_users_s3_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
                    'JOIN s_ox_users_s4_ch12 ON s_ox_users_s4_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
                    'JOIN s_ox_users_s5_ch12 ON s_ox_users_s5_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
                    'SET ??.??=? WHERE s_ox_users_s1_ch12.user_id=?';
                    var params2 = [t_string, qst_string, solve_r, type]
                    conn.query(sql2, params2, function(err2, rows2, fields) {
                        if (err2) {
                            console.log(err2);
                            res.status(500).send('Internal Server Error');
                            conn.rollback();
                        } else {
                            console.log(rows2);
                            var sql3 = 'UPDATE s_ox_users_vol_ch12 SET ??=??+1 WHERE user_id=?';
                            var params3 = [date_string, date_string, type]
                            conn.query(sql3, params3, function(err3, rows3, fields) {
                                if (err3) {
                                    console.log(err3);
                                    res.status(500).send('Internal Server Error');
                                    conn.rollback();
                                } else {
                                    console.log(rows3);
                                    res.send(rows3);
                                    conn.commit();
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}
update_ox()


function dbQueryAsync(query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (error, result) => {
            if (error) {
                reject(error);
            }
            resolve(result);                
        });
    });
}

///////////// (Table ID : s_ox_qs_ansr_ch01~12) Update OX 집계(풀이 합산) ///////////////////////////
// ** Sequence
// 1 Step : Read the ratio of correct/wrong answer -> Calculation 
// 2 Step : update OX solving result (sum of correct/wrong answer)
// function name : trigger_ox_OsumResult
async function trigger_ox_OsumResult() {
    var ox_ch_count = 12;  // OX 전체 단원 수
    var ox_qst_count = 40; // OX 단원 별 문항 수
    var ox_ans_count = 5;  // OX 풀이 회차
    var user_lv_count = 5; // 학습 레벨 단계 구분 (Lv1. ~ Lv5.)

    for(var i=1; i<=ox_ch_count; i++){
        let ch_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i; // 집계 테이블(Table ID: s_ox_qs_ansr_ch01~ch12) 단원 선택
        for(var j=1; j<=ox_qst_count; j++){
            let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j; // 문항 선택 (Column : ox_ch01(ch12)_q1~q40)
            for(var k=1; k<=user_lv_count; k++){
                var lv_string = "l" + k + "_o_sum"; // Update 학습 레벨 선택 (lv.1~lv.5)
                var qst5_sum = 0; // 집계 합산 변수 초기화
                for(var l=1; l<=ox_ans_count; l++){
                    let table_string = i<10 ? "s_ox_users_s" + l + "_ch0" + i : "s_ox_users_s" + l + "_ch" + i; // 풀이 테이블(Table ID: s_ox_user_s1(s5)_ch01~ch12) 선택
                // 단원&문항 별 정답수 산출 Query
                    let sql1 = 'SELECT COUNT(*) AS sumCount FROM ?? '
                    + 'JOIN s_users_id_info ON s_users_id_info.user_id = ??.user_id '
                    + 'WHERE ?? = 1 AND s_users_id_info.level = ?';
                    var params1 = [table_string, table_string, qst_string, k]
                // Update 정답 수 Query
                    var sql2 = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                    var params2 = [ch_string, lv_string, qst5_sum, qst_string]

                    try {
                        var FeedResult = await dbQueryAsync(sql1, params1);
                        qst5_sum = qst5_sum + FeedResult[0].sumCount;
                    } catch (err) {
                        console.log(err);
                    }
                }
                try {
                    await dbQueryAsync(sql2, params2);
                    console.log(ch_string + "_" + lv_string + "_" + qst_string + "_ : " + qst5_sum); // 합산 값 로그 체크
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}

async function trigger_ox_XsumResult() {
    var ox_ch_count = 12;  // OX 전체 단원 수
    var ox_qst_count = 40; // OX 단원 별 문항 수
    var ox_ans_count = 5;  // OX 풀이 회차
    var user_lv_count = 5; // 학습 레벨 단계 구분 (Lv1. ~ Lv5.)

    for(var i=1; i<=ox_ch_count; i++){
        let ch_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i; // 집계 테이블(Table ID: s_ox_qs_ansr_ch01~ch12) 단원 선택
        for(var j=1; j<=ox_qst_count; j++){
            let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j; // 문항 선택 (Column : ox_ch01(ch12)_q1~q40)
            for(var k=1; k<=user_lv_count; k++){
                var lv_string = "l" + k + "_x_sum"; // Update 학습 레벨 선택 (lv.1~lv.5)
                var qst5_sum = 0; // 집계 합산 변수 초기화
                for(var l=1; l<=ox_ans_count; l++){
                    let table_string = i<10 ? "s_ox_users_s" + l + "_ch0" + i : "s_ox_users_s" + l + "_ch" + i; // 풀이 테이블(Table ID: s_ox_user_s1(s5)_ch01~ch12) 선택
                // 단원&문항 별 오답수 산출 Query
                    let sql1 = 'SELECT COUNT(*) AS sumCount FROM ?? '
                    + 'JOIN s_users_id_info ON s_users_id_info.user_id = ??.user_id '
                    + 'WHERE ?? = 0 AND s_users_id_info.level = ?';
                    var params1 = [table_string, table_string, qst_string, k]
                // Update 오답 수 Query
                    var sql2 = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                    var params2 = [ch_string, lv_string, qst5_sum, qst_string]

                    try {
                        var FeedResult = await dbQueryAsync(sql1, params1);
                        qst5_sum = qst5_sum + FeedResult[0].sumCount;
                    } catch (err) {
                        console.log(err);
                    }
                }
                try {
                    await dbQueryAsync(sql2, params2);
                    console.log(ch_string + "_" + lv_string + "_" + qst_string + "_ : " + qst5_sum); // 합산 값 로그 체크
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}

async function trigger_ox_AvrResult() {
    var ox_ch_count = 12;  // OX 전체 단원 수
    var ox_qst_count = 40; // OX 단원 별 문항 수
    var user_lv_count = 5; // 학습 레벨 단계 구분 (Lv1. ~ Lv5.)

    for(var i=1; i<=ox_ch_count; i++){
        let table_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i; // 집계 테이블(Table ID: s_ox_qs_ansr_ch01~ch12) 단원 선택
        for(var j=1; j<=ox_qst_count; j++){
            let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j; // 문항 선택 (Column : ox_ch01(ch12)_q1~q40)
            var QstAvr_Osum = 0; // 집계 합산 변수 초기화
            var QstAvr_Xsum = 0; // 집계 합산 변수 초기화
            for(var k=1; k<=user_lv_count; k++){
                var lv_string1 = "l" + k + "_o_sum"; // Update 학습 레벨 선택 (lv.1~lv.5)
                var lv_string2 = "l" + k + "_x_sum"; // Update 학습 레벨 선택 (lv.1~lv.5)
                var lv_string3 = "l" + k + "_ox_avr";   // Update 학습 레벨 선택 (lv.1~lv.5)
            // 문항별 정답률 Query
                let sql1 = 'SELECT ?? AS Osum, ?? AS Xsum FROM ?? WHERE qst_id = ?';
                var params1 = [lv_string1, lv_string2, table_string, qst_string]
            // Update 오답 수 Query
                var sql2 = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                var params2 = [table_string, lv_string3, qstAvr_prec, qst_string]

                try {
                    var Qstsum = await dbQueryAsync(sql1, params1);
                    QstAvr_Osum = QstAvr_Osum + Qstsum[0].Osum;
                    QstAvr_Xsum = QstAvr_Xsum + Qstsum[0].Xsum;
                    try {
                        var qstAvr = Qstsum[0].Osum + Qstsum[0].Xsum != 0 ? Qstsum[0].Osum / (Qstsum[0].Osum + Qstsum[0].Xsum) : null;
                        var qstAvr_prec = qstAvr != null ? Math.ceil(qstAvr*100)/100 : null;
                        await dbQueryAsync(sql2, params2);
                    } catch (err) {
                        console.log(err);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            var QstAvr = QstAvr_Osum + QstAvr_Xsum != 0 ? QstAvr_Osum / (QstAvr_Osum + QstAvr_Xsum) : null;
            var QstAvr_prec = QstAvr != null ? Math.ceil(QstAvr*100)/100 : null;
            var sql3 = 'UPDATE ?? SET o_sum=?, x_sum=?, ox_avr=? WHERE qst_id=?'
            var params3 = [table_string, QstAvr_Osum, QstAvr_Xsum, QstAvr_prec, qst_string]

            try {
                await dbQueryAsync(sql3, params3);
            } catch (err) {
                console.log(err);
            }
        }
    }
}

async function TestFunction_UserScore() {
    var QstNum = 1;     // 임의의 문항번호 선택 (1번)
    var OrderNum = 2;   // 임의의 순차 (2번)
    var type = 11;      // 임의의 사용자 ID 선택 (11번)

    var QstString = "ox_ch01_q" + QstNum;
    var SolveArray_bit = new Array();
    var SolveArray_int = new Array();
    for(i=0; i<3; i++){
        OrderNum = OrderNum >0 ? OrderNum : 5;
        console.log(OrderNum); // 순차정보 Log
        var SolveTableNum = "s_ox_users_s" + OrderNum + "_ch01";
        var sql1 = 'SELECT ?? AS solveResult FROM ?? WHERE user_id = ?';
        var params1 = [QstString, SolveTableNum, type]

        try {
            SolveArray_bit[i] = await dbQueryAsync(sql1, params1);
            SolveArray_int[i] = SolveArray_bit[i].solveResult == 01 ? 1 : 0;
            
            const SolveArrayInt = Buffer.from(SolveArray_bit[i]);
            console.log(SolveArray_bit[i], " ", SolveArray_bit[i].lastIndexOf(1) !== -1);
            console.log(SolveTableNum + " " + QstString + " " + SolveArrayInt.readInt8()); // 배점 Array
        } catch (err) {
            console.log(err);
        }
        OrderNum = OrderNum - 1;
    }
    var ScoreWeight_1 = SolveArray_int[0]*4 + SolveArray_int[1]*2 + SolveArray_int[2]; // 배점 가중치 #1 산출
    var ScoreWeight_2 = 0; // 배점 가중치 #2 산출
    switch (ScoreWeight_1) {
        case 7:
            ScoreWeight_2 = 2;
            break;
        case 6:
            ScoreWeight_2 = 1.5;
            break;
        case 5:
            ScoreWeight_2 = 1;
            break;
        case 4:
            ScoreWeight_2 = 0.5;
            break;
        case 3:
            ScoreWeight_2 = -0.5;
            break;
        case 2:
            ScoreWeight_2 = -1;
            break;
        case 1:
            ScoreWeight_2 = -1.5;
            break;
        case 0:
            ScoreWeight_2 = -2;
            break;
    }

    var sql2 = 'SELECT ox_avr FROM s_ox_qs_ansr_ch01 WHERE qst_id = ?';
    var params2 = [QstString]

    try {
        var AnsRate = await dbQueryAsync(sql2, params2);
        var UnitScore = ScoreWeight_2 >=0 ? ScoreWeight_2 * (1 - AnsRate[0].ox_avr) : ScoreWeight_2 * AnsRate[0].ox_avr; // 단위 배점 산출
        console.log(ScoreWeight_1 + "_" + AnsRate[0].ox_avr + "_" + UnitScore);

    } catch (err) {
        console.log(err);
    }
}

TestFunction_UserScore();

/*
trigger_ox_OsumResult();
trigger_ox_XsumResult();
trigger_ox_AvrResult();
*/

/*
//////////////////////////////////////////////////////////////////////
// 특정시간 예약 이벤트 (node-schedule)
//////////////////////////////////////////////////////////////////////
const schedule = require('node-schedule');

const j = schedule.scheduleJob('10 * * * * *', function() {
    console.log("매 30분마다 실행");
    //trigger_ox_sum()
});
*/

//conn.end();