const express = require('express');

const app = express();

var mysql = require('mysql');


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


app.put('/api/s_ox_users_order_ch01/update/:type', function(req, res) {
    conn.beginTransaction((err)=>{
        let {type} = req.params;
        var col_num = req.body.col_num;
        var qst_string = "ox_ch01_q" + col_num;

        var sql1 = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?';
        var params1 = [qst_string, qst_string, type]
        conn.query(sql1, params1, function(err1, rows1, fields) {
            if (err1) {
                console.log(err1);
                res.status(500).send('Internal Server Error');
                conn.rollback();
            } else {
                var sql2 = 'UPDATE s_ox_users_s1_ch01 SET ??=1 WHERE user_id=?';
                var params2 = [qst_string, type]
                conn.query(sql2, params2, function(err2, rows2, fields) {
                    if (err2) {
                        console.log(err2);
                        res.status(500).send('Internal Server Error');
                        conn.rollback();
                    } else {
                        console.log(rows2);
                        res.send(rows2);
                        conn.commit();
                    }
                    // conn.end();
                });
            }
        });
    });
});


/*
///////////// (Table ID : s_ox_users_order_ch01~12) OX 순차 업데이트 ///////////////////////////
function update_ox_order() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_order_ch01/update/:type', function(req, res) {
        let {type} = req.params;
        var col_num = req.body.col_num;
        var qst_string = "ox_ch01_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch02_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch02 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch03_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch03 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch04_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch04 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch05_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch05 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch06_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch06 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch07_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch07 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch08_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch08 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch09_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch09 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch10_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch10 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch11_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch11 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
        var qst_string = "ox_ch12_q" + col_num;
        
        var sql = 'UPDATE s_ox_users_order_ch12 SET ??=??%5+1 WHERE user_id=?';
        var params = [qst_string, qst_string, type]
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
*/
///////////// (Table ID : s_ox_users_(s1~s5)_ch01~12) OX 풀이 업데이트 ///////////////////////////
function update_ox_solve() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_s1_ch01/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch01";
        var qst_string = "ox_ch01_q" + col_num;

        var sql = 'UPDATE s_ox_users_s1_ch01 ' +
        'JOIN s_ox_users_s2_ch01 ON s_ox_users_s2_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
        'JOIN s_ox_users_s3_ch01 ON s_ox_users_s3_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
        'JOIN s_ox_users_s4_ch01 ON s_ox_users_s4_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
        'JOIN s_ox_users_s5_ch01 ON s_ox_users_s5_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch01.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-2 /////////////
    app.put('/api/s_ox_users_s1_ch02/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch02";
        var qst_string = "ox_ch02_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch02 ' +
        'JOIN s_ox_users_s2_ch02 ON s_ox_users_s2_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
        'JOIN s_ox_users_s3_ch02 ON s_ox_users_s3_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
        'JOIN s_ox_users_s4_ch02 ON s_ox_users_s4_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
        'JOIN s_ox_users_s5_ch02 ON s_ox_users_s5_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch02.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-3 /////////////
    app.put('/api/s_ox_users_s1_ch03/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch03";
        var qst_string = "ox_ch03_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch03 ' +
        'JOIN s_ox_users_s2_ch03 ON s_ox_users_s2_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
        'JOIN s_ox_users_s3_ch03 ON s_ox_users_s3_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
        'JOIN s_ox_users_s4_ch03 ON s_ox_users_s4_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
        'JOIN s_ox_users_s5_ch03 ON s_ox_users_s5_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch03.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-4 /////////////
    app.put('/api/s_ox_users_s1_ch04/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch04";
        var qst_string = "ox_ch04_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch04 ' +
        'JOIN s_ox_users_s2_ch04 ON s_ox_users_s2_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
        'JOIN s_ox_users_s3_ch04 ON s_ox_users_s3_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
        'JOIN s_ox_users_s4_ch04 ON s_ox_users_s4_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
        'JOIN s_ox_users_s5_ch04 ON s_ox_users_s5_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch04.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-5 /////////////
    app.put('/api/s_ox_users_s1_ch05/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch05";
        var qst_string = "ox_ch05_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch05 ' +
        'JOIN s_ox_users_s2_ch05 ON s_ox_users_s2_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
        'JOIN s_ox_users_s3_ch05 ON s_ox_users_s3_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
        'JOIN s_ox_users_s4_ch05 ON s_ox_users_s4_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
        'JOIN s_ox_users_s5_ch05 ON s_ox_users_s5_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch05.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-6 /////////////
    app.put('/api/s_ox_users_s1_ch06/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch06";
        var qst_string = "ox_ch06_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch06 ' +
        'JOIN s_ox_users_s2_ch06 ON s_ox_users_s2_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
        'JOIN s_ox_users_s3_ch06 ON s_ox_users_s3_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
        'JOIN s_ox_users_s4_ch06 ON s_ox_users_s4_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
        'JOIN s_ox_users_s5_ch06 ON s_ox_users_s5_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch06.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-7 /////////////
    app.put('/api/s_ox_users_s1_ch07/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch07";
        var qst_string = "ox_ch07_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch07 ' +
        'JOIN s_ox_users_s2_ch07 ON s_ox_users_s2_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
        'JOIN s_ox_users_s3_ch07 ON s_ox_users_s3_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
        'JOIN s_ox_users_s4_ch07 ON s_ox_users_s4_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
        'JOIN s_ox_users_s5_ch07 ON s_ox_users_s5_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch07.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-8 /////////////
    app.put('/api/s_ox_users_s1_ch08/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch08";
        var qst_string = "ox_ch08_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch08 ' +
        'JOIN s_ox_users_s2_ch08 ON s_ox_users_s2_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
        'JOIN s_ox_users_s3_ch08 ON s_ox_users_s3_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
        'JOIN s_ox_users_s4_ch08 ON s_ox_users_s4_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
        'JOIN s_ox_users_s5_ch08 ON s_ox_users_s5_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch08.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-9 /////////////
    app.put('/api/s_ox_users_s1_ch09/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch09";
        var qst_string = "ox_ch09_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch09 ' +
        'JOIN s_ox_users_s2_ch09 ON s_ox_users_s2_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
        'JOIN s_ox_users_s3_ch09 ON s_ox_users_s3_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
        'JOIN s_ox_users_s4_ch09 ON s_ox_users_s4_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
        'JOIN s_ox_users_s5_ch09 ON s_ox_users_s5_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch09.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-10 /////////////
    app.put('/api/s_ox_users_s1_ch10/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch10";
        var qst_string = "ox_ch10_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch10 ' +
        'JOIN s_ox_users_s2_ch10 ON s_ox_users_s2_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
        'JOIN s_ox_users_s3_ch10 ON s_ox_users_s3_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
        'JOIN s_ox_users_s4_ch10 ON s_ox_users_s4_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
        'JOIN s_ox_users_s5_ch10 ON s_ox_users_s5_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch10.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-11 /////////////
    app.put('/api/s_ox_users_s1_ch11/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch11";
        var qst_string = "ox_ch11_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch11 ' +
        'JOIN s_ox_users_s2_ch11 ON s_ox_users_s2_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
        'JOIN s_ox_users_s3_ch11 ON s_ox_users_s3_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
        'JOIN s_ox_users_s4_ch11 ON s_ox_users_s4_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
        'JOIN s_ox_users_s5_ch11 ON s_ox_users_s5_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch11.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });

    ///////////// OX Chapter-12 /////////////
    app.put('/api/s_ox_users_s1_ch12/update/:type', function(req, res) {
        let {type} = req.params;
        var order_table = req.body.order_table;
        var col_num = req.body.col_num;
        var solve_result = req.body.solve_result;
        var table_string = "s_ox_users_s" + order_table + "_ch12";
        var qst_string = "ox_ch12_q" + col_num

        var sql = 'UPDATE s_ox_users_s1_ch12 ' +
        'JOIN s_ox_users_s2_ch12 ON s_ox_users_s2_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
        'JOIN s_ox_users_s3_ch12 ON s_ox_users_s3_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
        'JOIN s_ox_users_s4_ch12 ON s_ox_users_s4_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
        'JOIN s_ox_users_s5_ch12 ON s_ox_users_s5_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
        'SET ??.??=? WHERE s_ox_users_s1_ch12.user_id=?';
        var params = [table_string, qst_string, solve_result, type]
        conn.query(sql, params, function(err, rows, fields) {
            if (err) {
                console.log(err);
                console.log(table_name);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(rows);
                res.send(rows);
            }
        });
    });
}
update_ox_solve()



//////////////////////////////////////////////////////////////////////
// 특정시간 예약 이벤트 (node-schedule)
//////////////////////////////////////////////////////////////////////
const schedule = require('node-schedule');

const j = schedule.scheduleJob('10 * * * * *', function() {
    console.log("매 10초마다 실행");
});


//conn.end();