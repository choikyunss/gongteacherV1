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

///////////// (Table ID : s_users_id_info) 사용자 신규 추가 ///////////////////////////
/// TODO : 동일 이메일 가입 시도 시, 체크하여 중복가입 막기 -> 적용 해야함.//
app.post('/api/s_users_id_info/add', function(req, res) {
    var req_body = req.body;
    console.log(req_body);
    var login_id = req.body.login_id.toString();
    var email = req.body.email.toString();
    var join_route = req.body.join_route.toString();
    var join_date = req.body.join_date.toString();
    var level = 1; // 신규 가입자의 학습레벨은 무조건 1단계 //
    var app_version = req.body.app_version;
    var c_login_date = req.body.c_login_date.toString();
    var p_login_date = req.body.c_login_date.toString();
    
    var sql = 'INSERT INTO s_users_id_info (login_id, email, join_route, join_date, level, app_version, c_login_date, p_login_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [login_id, email, join_route, join_date, level, app_version, c_login_date, p_login_date], (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_users_id_info) 사용자 정보 불러오기 (join_route, join_date, c_login_date, p_login_date) ///////////////////////////
app.get('/api/s_users_id_info/read/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('SELECT user_id, join_route, join_date, c_login_date, p_login_date FROM s_users_id_info WHERE login_id = ?;', type, function(err, rows, fields) {
        if (err) {
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_users_id_info) 사용자 정보 업데이트 (app_version, c_login_date, p_login_date) ///////////////////////////
app.put('/api/s_users_id_info/update/:type', function(req, res) {
    let {type} = req.params;
    var app_version = req.body.app_version;
    var c_login_date = req.body.c_login_date.toString();

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

///////////// (Table ID : s_system_id_info) 시스템 정보 불러오기 (final_ver, mandatory_update_ver) ///////////////////////////
app.get('/api/s_system_id_info/read/:type', async(req, res) => {

    let {type} = req.params;

    conn.query('SELECT final_ver, mandatory_update_ver FROM s_system_id_info WHERE system_id = ?;', type, function(err, rows, fields) {
        if (err) {
            res.send(err);
        } else {
            res.send(rows);
        }
    });
});

///////////// (Table ID : s_ox_users_order_ch01~12) OX 순차 신규 생성 ///////////////////////////
function add_ox_order() {
    ///////////// OX Chapter-1 /////////////
    app.post('/api/s_ox_users_order_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-2 /////////////
    app.post('/api/s_ox_users_order_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-3 /////////////
    app.post('/api/s_ox_users_order_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-4 /////////////
    app.post('/api/s_ox_users_order_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-5 /////////////
    app.post('/api/s_ox_users_order_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-6 /////////////
    app.post('/api/s_ox_users_order_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-7 /////////////
    app.post('/api/s_ox_users_order_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-8 /////////////
    app.post('/api/s_ox_users_order_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-9 /////////////
    app.post('/api/s_ox_users_order_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-10 /////////////
    app.post('/api/s_ox_users_order_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-11 /////////////
    app.post('/api/s_ox_users_order_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-12 /////////////
    app.post('/api/s_ox_users_order_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40;
        for(var i = 0; i < q_count; i++){  // 문항별 순차 정보 초기화 (1값 입력) //
            qst[i] = 1;
        }

        var sql = 'INSERT INTO s_ox_users_order_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });
}
add_ox_order()

///////////// (Table ID : s_ox_users_order_ch01~12) OX 순차 불러오기 ///////////////////////////
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

///////////// (Table ID : s_ox_users_order_ch01~12) OX 순차 업데이트 ///////////////////////////
function update_ox_order() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_order_ch01/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-2 /////////////
    app.put('/api/s_ox_users_order_ch02/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch02 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-3 /////////////
    app.put('/api/s_ox_users_order_ch03/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch03 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-4 /////////////
    app.put('/api/s_ox_users_order_ch04/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch04 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-5 /////////////
    app.put('/api/s_ox_users_order_ch05/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch05 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-6 /////////////
    app.put('/api/s_ox_users_order_ch06/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch06 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-7 /////////////
    app.put('/api/s_ox_users_order_ch07/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch07 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-8 /////////////
    app.put('/api/s_ox_users_order_ch08/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch08 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-9 /////////////
    app.put('/api/s_ox_users_order_ch09/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch09 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-10 /////////////
    app.put('/api/s_ox_users_order_ch10/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch10 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-11 /////////////
    app.put('/api/s_ox_users_order_ch11/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch11 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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

    ///////////// OX Chapter-12 /////////////
    app.put('/api/s_ox_users_order_ch12/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch12 SET ??=??%5+1 WHERE user_id=?';
        var params = [col_num, col_num, type]
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
}
update_ox_order()

///////////// (Table ID : s_ox_users_s1_ch01~12) OX #1 풀이 신규 추가 ///////////////////////////
function add_ox_solve_s1() {
    ///////////// OX #1 Chapter-1 /////////////
    app.post('/api/s_ox_users_s1_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-2 /////////////
    app.post('/api/s_ox_users_s1_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-3 /////////////
    app.post('/api/s_ox_users_s1_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-4 /////////////
    app.post('/api/s_ox_users_s1_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-5 /////////////
    app.post('/api/s_ox_users_s1_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-6 /////////////
    app.post('/api/s_ox_users_s1_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-7 /////////////
    app.post('/api/s_ox_users_s1_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-8 /////////////
    app.post('/api/s_ox_users_s1_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-9 /////////////
    app.post('/api/s_ox_users_s1_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-10 /////////////
    app.post('/api/s_ox_users_s1_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-11 /////////////
    app.post('/api/s_ox_users_s1_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #1 Chapter-12 /////////////
    app.post('/api/s_ox_users_s1_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s1_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

}
add_ox_solve_s1()

///////////// (Table ID : s_ox_users_s2_ch01~12) OX #2 풀이 신규 추가 ///////////////////////////
function add_ox_solve_s2() {
    ///////////// OX #2 Chapter-1 /////////////
    app.post('/api/s_ox_users_s2_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-2 /////////////
    app.post('/api/s_ox_users_s2_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-3 /////////////
    app.post('/api/s_ox_users_s2_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-4 /////////////
    app.post('/api/s_ox_users_s2_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-5 /////////////
    app.post('/api/s_ox_users_s2_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-6 /////////////
    app.post('/api/s_ox_users_s2_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-7 /////////////
    app.post('/api/s_ox_users_s2_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-8 /////////////
    app.post('/api/s_ox_users_s2_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-9 /////////////
    app.post('/api/s_ox_users_s2_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-10 /////////////
    app.post('/api/s_ox_users_s2_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-11 /////////////
    app.post('/api/s_ox_users_s2_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #2 Chapter-12 /////////////
    app.post('/api/s_ox_users_s2_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s2_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

}
add_ox_solve_s2()

///////////// (Table ID : s_ox_users_s3_ch01~12) OX #3 풀이 신규 추가 ///////////////////////////
function add_ox_solve_s3() {
    ///////////// OX #3 Chapter-1 /////////////
    app.post('/api/s_ox_users_s3_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-2 /////////////
    app.post('/api/s_ox_users_s3_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-3 /////////////
    app.post('/api/s_ox_users_s3_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-4 /////////////
    app.post('/api/s_ox_users_s3_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-5 /////////////
    app.post('/api/s_ox_users_s3_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-6 /////////////
    app.post('/api/s_ox_users_s3_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-7 /////////////
    app.post('/api/s_ox_users_s3_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-8 /////////////
    app.post('/api/s_ox_users_s3_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-9 /////////////
    app.post('/api/s_ox_users_s3_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-10 /////////////
    app.post('/api/s_ox_users_s3_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-11 /////////////
    app.post('/api/s_ox_users_s3_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #3 Chapter-12 /////////////
    app.post('/api/s_ox_users_s3_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s3_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

}
add_ox_solve_s3()

///////////// (Table ID : s_ox_users_s4_ch01~12) OX #4 풀이 신규 추가 ///////////////////////////
function add_ox_solve_s4() {
    ///////////// OX #4 Chapter-1 /////////////
    app.post('/api/s_ox_users_s4_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-2 /////////////
    app.post('/api/s_ox_users_s4_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-3 /////////////
    app.post('/api/s_ox_users_s4_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-4 /////////////
    app.post('/api/s_ox_users_s4_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-5 /////////////
    app.post('/api/s_ox_users_s4_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-6 /////////////
    app.post('/api/s_ox_users_s4_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-7 /////////////
    app.post('/api/s_ox_users_s4_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-8 /////////////
    app.post('/api/s_ox_users_s4_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-9 /////////////
    app.post('/api/s_ox_users_s4_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-10 /////////////
    app.post('/api/s_ox_users_s4_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-11 /////////////
    app.post('/api/s_ox_users_s4_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #4 Chapter-12 /////////////
    app.post('/api/s_ox_users_s4_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s4_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

}
add_ox_solve_s4()

///////////// (Table ID : s_ox_users_s5_ch01~12) OX #5 풀이 신규 추가 ///////////////////////////
function add_ox_solve_s5() {
    ///////////// OX #5 Chapter-1 /////////////
    app.post('/api/s_ox_users_s5_ch01/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch01 ' +
        '(ox_ch01_q1, ox_ch01_q2, ox_ch01_q3, ox_ch01_q4, ox_ch01_q5, ox_ch01_q6, ox_ch01_q7, ox_ch01_q8, ox_ch01_q9, ox_ch01_q10, ' +
        'ox_ch01_q11, ox_ch01_q12, ox_ch01_q13, ox_ch01_q14, ox_ch01_q15, ox_ch01_q16, ox_ch01_q17, ox_ch01_q18, ox_ch01_q19, ox_ch01_q20, ' +
        'ox_ch01_q21, ox_ch01_q22, ox_ch01_q23, ox_ch01_q24, ox_ch01_q25, ox_ch01_q26, ox_ch01_q27, ox_ch01_q28, ox_ch01_q29, ox_ch01_q30, ' +
        'ox_ch01_q31, ox_ch01_q32, ox_ch01_q33, ox_ch01_q34, ox_ch01_q35, ox_ch01_q36, ox_ch01_q37, ox_ch01_q38, ox_ch01_q39, ox_ch01_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-2 /////////////
    app.post('/api/s_ox_users_s5_ch02/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch02 ' +
        '(ox_ch02_q1, ox_ch02_q2, ox_ch02_q3, ox_ch02_q4, ox_ch02_q5, ox_ch02_q6, ox_ch02_q7, ox_ch02_q8, ox_ch02_q9, ox_ch02_q10, ' +
        'ox_ch02_q11, ox_ch02_q12, ox_ch02_q13, ox_ch02_q14, ox_ch02_q15, ox_ch02_q16, ox_ch02_q17, ox_ch02_q18, ox_ch02_q19, ox_ch02_q20, ' +
        'ox_ch02_q21, ox_ch02_q22, ox_ch02_q23, ox_ch02_q24, ox_ch02_q25, ox_ch02_q26, ox_ch02_q27, ox_ch02_q28, ox_ch02_q29, ox_ch02_q30, ' +
        'ox_ch02_q31, ox_ch02_q32, ox_ch02_q33, ox_ch02_q34, ox_ch02_q35, ox_ch02_q36, ox_ch02_q37, ox_ch02_q38, ox_ch02_q39, ox_ch02_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-3 /////////////
    app.post('/api/s_ox_users_s5_ch03/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch03 ' +
        '(ox_ch03_q1, ox_ch03_q2, ox_ch03_q3, ox_ch03_q4, ox_ch03_q5, ox_ch03_q6, ox_ch03_q7, ox_ch03_q8, ox_ch03_q9, ox_ch03_q10, ' +
        'ox_ch03_q11, ox_ch03_q12, ox_ch03_q13, ox_ch03_q14, ox_ch03_q15, ox_ch03_q16, ox_ch03_q17, ox_ch03_q18, ox_ch03_q19, ox_ch03_q20, ' +
        'ox_ch03_q21, ox_ch03_q22, ox_ch03_q23, ox_ch03_q24, ox_ch03_q25, ox_ch03_q26, ox_ch03_q27, ox_ch03_q28, ox_ch03_q29, ox_ch03_q30, ' +
        'ox_ch03_q31, ox_ch03_q32, ox_ch03_q33, ox_ch03_q34, ox_ch03_q35, ox_ch03_q36, ox_ch03_q37, ox_ch03_q38, ox_ch03_q39, ox_ch03_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-4 /////////////
    app.post('/api/s_ox_users_s5_ch04/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch04 ' +
        '(ox_ch04_q1, ox_ch04_q2, ox_ch04_q3, ox_ch04_q4, ox_ch04_q5, ox_ch04_q6, ox_ch04_q7, ox_ch04_q8, ox_ch04_q9, ox_ch04_q10, ' +
        'ox_ch04_q11, ox_ch04_q12, ox_ch04_q13, ox_ch04_q14, ox_ch04_q15, ox_ch04_q16, ox_ch04_q17, ox_ch04_q18, ox_ch04_q19, ox_ch04_q20, ' +
        'ox_ch04_q21, ox_ch04_q22, ox_ch04_q23, ox_ch04_q24, ox_ch04_q25, ox_ch04_q26, ox_ch04_q27, ox_ch04_q28, ox_ch04_q29, ox_ch04_q30, ' +
        'ox_ch04_q31, ox_ch04_q32, ox_ch04_q33, ox_ch04_q34, ox_ch04_q35, ox_ch04_q36, ox_ch04_q37, ox_ch04_q38, ox_ch04_q39, ox_ch04_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-5 /////////////
    app.post('/api/s_ox_users_s5_ch05/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch05 ' +
        '(ox_ch05_q1, ox_ch05_q2, ox_ch05_q3, ox_ch05_q4, ox_ch05_q5, ox_ch05_q6, ox_ch05_q7, ox_ch05_q8, ox_ch05_q9, ox_ch05_q10, ' +
        'ox_ch05_q11, ox_ch05_q12, ox_ch05_q13, ox_ch05_q14, ox_ch05_q15, ox_ch05_q16, ox_ch05_q17, ox_ch05_q18, ox_ch05_q19, ox_ch05_q20, ' +
        'ox_ch05_q21, ox_ch05_q22, ox_ch05_q23, ox_ch05_q24, ox_ch05_q25, ox_ch05_q26, ox_ch05_q27, ox_ch05_q28, ox_ch05_q29, ox_ch05_q30, ' +
        'ox_ch05_q31, ox_ch05_q32, ox_ch05_q33, ox_ch05_q34, ox_ch05_q35, ox_ch05_q36, ox_ch05_q37, ox_ch05_q38, ox_ch05_q39, ox_ch05_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-6 /////////////
    app.post('/api/s_ox_users_s5_ch06/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch06 ' +
        '(ox_ch06_q1, ox_ch06_q2, ox_ch06_q3, ox_ch06_q4, ox_ch06_q5, ox_ch06_q6, ox_ch06_q7, ox_ch06_q8, ox_ch06_q9, ox_ch06_q10, ' +
        'ox_ch06_q11, ox_ch06_q12, ox_ch06_q13, ox_ch06_q14, ox_ch06_q15, ox_ch06_q16, ox_ch06_q17, ox_ch06_q18, ox_ch06_q19, ox_ch06_q20, ' +
        'ox_ch06_q21, ox_ch06_q22, ox_ch06_q23, ox_ch06_q24, ox_ch06_q25, ox_ch06_q26, ox_ch06_q27, ox_ch06_q28, ox_ch06_q29, ox_ch06_q30, ' +
        'ox_ch06_q31, ox_ch06_q32, ox_ch06_q33, ox_ch06_q34, ox_ch06_q35, ox_ch06_q36, ox_ch06_q37, ox_ch06_q38, ox_ch06_q39, ox_ch06_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-7 /////////////
    app.post('/api/s_ox_users_s5_ch07/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch07 ' +
        '(ox_ch07_q1, ox_ch07_q2, ox_ch07_q3, ox_ch07_q4, ox_ch07_q5, ox_ch07_q6, ox_ch07_q7, ox_ch07_q8, ox_ch07_q9, ox_ch07_q10, ' +
        'ox_ch07_q11, ox_ch07_q12, ox_ch07_q13, ox_ch07_q14, ox_ch07_q15, ox_ch07_q16, ox_ch07_q17, ox_ch07_q18, ox_ch07_q19, ox_ch07_q20, ' +
        'ox_ch07_q21, ox_ch07_q22, ox_ch07_q23, ox_ch07_q24, ox_ch07_q25, ox_ch07_q26, ox_ch07_q27, ox_ch07_q28, ox_ch07_q29, ox_ch07_q30, ' +
        'ox_ch07_q31, ox_ch07_q32, ox_ch07_q33, ox_ch07_q34, ox_ch07_q35, ox_ch07_q36, ox_ch07_q37, ox_ch07_q38, ox_ch07_q39, ox_ch07_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-8 /////////////
    app.post('/api/s_ox_users_s5_ch08/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch08 ' +
        '(ox_ch08_q1, ox_ch08_q2, ox_ch08_q3, ox_ch08_q4, ox_ch08_q5, ox_ch08_q6, ox_ch08_q7, ox_ch08_q8, ox_ch08_q9, ox_ch08_q10, ' +
        'ox_ch08_q11, ox_ch08_q12, ox_ch08_q13, ox_ch08_q14, ox_ch08_q15, ox_ch08_q16, ox_ch08_q17, ox_ch08_q18, ox_ch08_q19, ox_ch08_q20, ' +
        'ox_ch08_q21, ox_ch08_q22, ox_ch08_q23, ox_ch08_q24, ox_ch08_q25, ox_ch08_q26, ox_ch08_q27, ox_ch08_q28, ox_ch08_q29, ox_ch08_q30, ' +
        'ox_ch08_q31, ox_ch08_q32, ox_ch08_q33, ox_ch08_q34, ox_ch08_q35, ox_ch08_q36, ox_ch08_q37, ox_ch08_q38, ox_ch08_q39, ox_ch08_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-9 /////////////
    app.post('/api/s_ox_users_s5_ch09/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch09 ' +
        '(ox_ch09_q1, ox_ch09_q2, ox_ch09_q3, ox_ch09_q4, ox_ch09_q5, ox_ch09_q6, ox_ch09_q7, ox_ch09_q8, ox_ch09_q9, ox_ch09_q10, ' +
        'ox_ch09_q11, ox_ch09_q12, ox_ch09_q13, ox_ch09_q14, ox_ch09_q15, ox_ch09_q16, ox_ch09_q17, ox_ch09_q18, ox_ch09_q19, ox_ch09_q20, ' +
        'ox_ch09_q21, ox_ch09_q22, ox_ch09_q23, ox_ch09_q24, ox_ch09_q25, ox_ch09_q26, ox_ch09_q27, ox_ch09_q28, ox_ch09_q29, ox_ch09_q30, ' +
        'ox_ch09_q31, ox_ch09_q32, ox_ch09_q33, ox_ch09_q34, ox_ch09_q35, ox_ch09_q36, ox_ch09_q37, ox_ch09_q38, ox_ch09_q39, ox_ch09_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-10 /////////////
    app.post('/api/s_ox_users_s5_ch10/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch10 ' +
        '(ox_ch10_q1, ox_ch10_q2, ox_ch10_q3, ox_ch10_q4, ox_ch10_q5, ox_ch10_q6, ox_ch10_q7, ox_ch10_q8, ox_ch10_q9, ox_ch10_q10, ' +
        'ox_ch10_q11, ox_ch10_q12, ox_ch10_q13, ox_ch10_q14, ox_ch10_q15, ox_ch10_q16, ox_ch10_q17, ox_ch10_q18, ox_ch10_q19, ox_ch10_q20, ' +
        'ox_ch10_q21, ox_ch10_q22, ox_ch10_q23, ox_ch10_q24, ox_ch10_q25, ox_ch10_q26, ox_ch10_q27, ox_ch10_q28, ox_ch10_q29, ox_ch10_q30, ' +
        'ox_ch10_q31, ox_ch10_q32, ox_ch10_q33, ox_ch10_q34, ox_ch10_q35, ox_ch10_q36, ox_ch10_q37, ox_ch10_q38, ox_ch10_q39, ox_ch10_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-11 /////////////
    app.post('/api/s_ox_users_s5_ch11/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch11 ' +
        '(ox_ch11_q1, ox_ch11_q2, ox_ch11_q3, ox_ch11_q4, ox_ch11_q5, ox_ch11_q6, ox_ch11_q7, ox_ch11_q8, ox_ch11_q9, ox_ch11_q10, ' +
        'ox_ch11_q11, ox_ch11_q12, ox_ch11_q13, ox_ch11_q14, ox_ch11_q15, ox_ch11_q16, ox_ch11_q17, ox_ch11_q18, ox_ch11_q19, ox_ch11_q20, ' +
        'ox_ch11_q21, ox_ch11_q22, ox_ch11_q23, ox_ch11_q24, ox_ch11_q25, ox_ch11_q26, ox_ch11_q27, ox_ch11_q28, ox_ch11_q29, ox_ch11_q30, ' +
        'ox_ch11_q31, ox_ch11_q32, ox_ch11_q33, ox_ch11_q34, ox_ch11_q35, ox_ch11_q36, ox_ch11_q37, ox_ch11_q38, ox_ch11_q39, ox_ch11_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX #5 Chapter-12 /////////////
    app.post('/api/s_ox_users_s5_ch12/add', function(req, res) {
        var req_body = req.body;
        console.log(req_body);
        var qst = new Array();
        var q_count = 40; // 문항 수 40문항으로 설정 //
        for(var i = 0; i < q_count; i++){  // 문항별 정답 정보 초기화 (NULL값 입력) //
            qst[i] = null;
        }

        var sql = 'INSERT INTO s_ox_users_s5_ch12 ' +
        '(ox_ch12_q1, ox_ch12_q2, ox_ch12_q3, ox_ch12_q4, ox_ch12_q5, ox_ch12_q6, ox_ch12_q7, ox_ch12_q8, ox_ch12_q9, ox_ch12_q10, ' +
        'ox_ch12_q11, ox_ch12_q12, ox_ch12_q13, ox_ch12_q14, ox_ch12_q15, ox_ch12_q16, ox_ch12_q17, ox_ch12_q18, ox_ch12_q19, ox_ch12_q20, ' +
        'ox_ch12_q21, ox_ch12_q22, ox_ch12_q23, ox_ch12_q24, ox_ch12_q25, ox_ch12_q26, ox_ch12_q27, ox_ch12_q28, ox_ch12_q29, ox_ch12_q30, ' +
        'ox_ch12_q31, ox_ch12_q32, ox_ch12_q33, ox_ch12_q34, ox_ch12_q35, ox_ch12_q36, ox_ch12_q37, ox_ch12_q38, ox_ch12_q39, ox_ch12_q40) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'; 
        conn.query(sql, qst, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

}
add_ox_solve_s5()

//////////////////////////////////////////////////////////////////////
// 특정시간 예약 이벤트 (node-schedule)
//////////////////////////////////////////////////////////////////////


///////////// OX Chapter-1 /////////////
app.put('/api/s_ox_users_s1_ch01/update/:type', function(req, res) {
    let {type} = req.params;
    var order_num = req.body.order_num;
    var col_num = req.body.col_num;
    var solve_result = req.body.solve_result;

    if (order_num = 1) {
        var sql1 = 'UPDATE s_ox_users_s1_ch01 SET ??=? WHERE user_id=?';
        var params = [col_num, solve_result, type]
        conn.query(sql1, params, function(err1, rows1, fields) {
            if (err1) {
                console.log(err1);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows1);
                res.send(rows1);
            }
        });
    }

    else if (order_num = 2) {
        var sql2 = 'UPDATE s_ox_users_s2_ch01 SET ??=? WHERE user_id=?';
        var params = [col_num, solve_result, type]
        conn.query(sql2, params, function(err2, rows2, fields) {
            if (err2) {
                console.log(err2);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows2);
                res.send(rows2);
            }
        });
    }

    else {}
});

/*
///////////// OX Chapter-1 /////////////
app.put('/api/s_ox_users_order_ch01/update/:type', function(req, res) {
    let {type} = req.params;
    var col_num = req.body.col_num;
        
    var sql = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?';
    var params = [col_num, col_num, type]
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
*/

const schedule = require('node-schedule');

const j = schedule.scheduleJob('10 * * * * *', function() {
    console.log("매 10초마다 실행");
});


//conn.end();