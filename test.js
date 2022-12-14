// Express Module
const express = require('express');
const app = express();

// Mysql2 Module
var mysql = require('mysql2/promise');

// Database Pool Object
var pool = mysql.createPool({
    host : 'kyunss-db.cjwyxnwnqovj.ap-northeast-2.rds.amazonaws.com',
    user : 'kyunss_admin',
    password : 'Choibjk6014#',
    database : 'Gong_Teacher',
    connectionLimit : 10000
});

// body-parser
var bodyParser = require('body-parser');

// body-parser 가 클라이언트에서 오는 정보를 서버에서 분석 후 가져오게 하는데 1. 인코딩된 url을 가져오는 방법, 2. json 타입으로 된 것을 가져오는 방법 두 가지 모두 가져올 수 있도록 합니다.
app.use(bodyParser.urlencoded({ extended: true,}));
app.use(bodyParser.json());

const server = app.listen(3001, () => {
    console.log('Start Server : 13.124.19.61:3001');

});

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
app.post('/api/s_users_id_info/add', async (req, res) => {
    const conn = await pool.getConnection(async conn => conn);
    try {
        var req_body = req.body;
        console.log(req_body);
    
        var login_id = req.body.login_id.toString();      // : Log-In ID (Primary Key)
        var email = req.body.email.toString();            // : E-Mail Address
        var join_route = req.body.join_route.toString();  // : Subscription route (Naver, Kakao Talk, Google)
        var join_date = date.toString();                  // : Initial Subscription Date
        var level = 1;                                    // : New user's learning level is ... '1'
        var app_version = req.body.app_version;           // : App version
        var terms_accept = req.body.terms_accept;         // : Acceptance of the terms & conditions
        var ad_accept = req.body.ad_accept;               // : Acceptance of receving advertisements
        
        var sql = 'INSERT INTO s_users_id_info' 
                + ' (login_id, email, join_route, join_date, level, app_version, c_login_date, p_login_date, terms_accept, ad_accept)'
                + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [rows] = await conn.query(sql, [login_id, email, join_route, join_date, level, app_version, join_date, join_date, terms_accept, ad_accept]);
        conn.release();
        res.json(rows);

    } catch(err) {
        res.status(500).json({message: err.message});
    } finally {
        conn.release();
    }
});
// !! HTTP requst URL/BODY
/*
{
    "login_id": "e",
    "email": "e@naver.com",
    "join_route": "naver",
    "app_version": 1,
    "terms_accept": 1,
    "ad_accept": 1
}
*/


///////////// (Table ID : s_users_id_info) 사용자 정보 불러오기 ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/read/:type
// ** Contents : join_route, join_date, c_login_date, p_login_date, terms_accept, ad_accept
app.get('/api/s_users_id_info/read/:type', async(req, res) => {
    const conn = await pool.getConnection(async conn => conn); // Get connection from pool object
    try {
        let {type} = req.params;
        var sql = 'SELECT user_id, join_route, join_date, c_login_date, p_login_date, terms_accept, ad_accept FROM s_users_id_info WHERE login_id = ?;'
        const [rows] = await conn.query(sql, type);
        res.json(rows);

    } catch(err) {
        res.status(500).json({message: err.message});
    } finally {
        conn.release(); // Return connection
    }
});


///////////// (Table ID : s_users_id_info) 사용자 정보 업데이트 (app_version, c_login_date, p_login_date) ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/update1/:type (type : login_id)
// ** Body(JSON) : { "app_version": (INT) }
app.put('/api/s_users_id_info/update1/:type', async(req, res) => {
    const conn = await pool.getConnection(async conn => conn);
    try {
        let {type} = req.params;
        var app_version = req.body.app_version;
        var c_login_date = date.toString();

        var sqlA = 'SELECT c_login_date FROM s_users_id_info WHERE login_id = ?';
        var sqlB = 'UPDATE s_users_id_info SET app_version=?, c_login_date=?, p_login_date=? WHERE login_id=?';

        await conn.beginTransaction();
        const [rowsA] = await conn.query(sqlA, type);
        var p_login_date = getFormatDate(rowsA[0].c_login_date).toString(); // Date Format : 2022-11-11T00:00:00:00.000Z -> 2022-11-11
        var params = [app_version, c_login_date, p_login_date, type]
        const [rowsB] = await conn.query(sqlB, params);
        await conn.commit();
        res.json(rowsB);

    } catch(err) {
        await conn.rollback();
        console.log(err);
        res.status(500).json({message: err.message});
    } finally {
        conn.release();
    }
});
// !! HTTP requst URL/BODY
/*
{
    "app_version": 2
}
*/


///////////// (Table ID : s_users_id_info) 사용자 정보 업데이트 (약관 및 광고수신 동의 여부) ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/update2/:type (type : login_id)
// ** Body(JSON) : { "terms_accept": 0/1 (BIT), "ad_accept": 0/1 (BIT)  }
app.put('/api/s_users_id_info/update2/:type', async(req, res) => {
    const conn = await pool.getConnection(async conn => conn);
    try {
        let {type} = req.params;
        var terms_accept = req.body.terms_accept;
        var ad_accept = req.body.ad_accept;

        var sql = 'UPDATE s_users_id_info SET terms_accept=?, ad_accept=? WHERE login_id=?';
        var params = [terms_accept, ad_accept, type]
        const [rows] = await conn.query(sql, params);
        res.json(rows);

    } catch(err) {
        console.log(err);
        res.status(500).json({message: err.message});
    } finally {
        conn.release(); // Return connection
    }
});
// !! HTTP requst URL/BODY
/*
{
    "terms_accept": 1,
    "ad_accept": 0
}
*/


///////////// (Table ID : s_system_id_info) 시스템 정보 불러오기 ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_users_id_info/update2/:type (type : system_id)
// ** Contents : final_ver, mandatory_update_ver, maint_period
app.get('/api/s_system_id_info/read/:type', async(req, res) => {
    const conn = await pool.getConnection(async conn => conn);
    try {
        let {type} = req.params;
        var sql = 'SELECT final_ver, mandatory_update_ver, maint_period FROM s_system_id_info WHERE system_id = ?';
        const [rows] = await conn.query(sql, type);
        res.json(rows);

    } catch(err) {
        console.log(err);
        res.status(500).json({message: err.message});
    } finally {
        conn.release(); // Return connection
    }
});


///////////// (Table ID : s_ox_users_order_ch01~12) Read OX order ///////////////////////////
// ** URL : http://13.124.19.61:3001/api/s_ox_users_order_ch01/read/:type (type : user_id)
// ** Contents : user_id, ox_ch01_q1~q40
function read_ox_order() {
    ///////////// OX Chapter-1 /////////////
    app.get('/api/s_ox_users_order_ch01/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch01 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-2 /////////////
    app.get('/api/s_ox_users_order_ch02/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch02 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-3 /////////////
    app.get('/api/s_ox_users_order_ch03/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch03 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-4 /////////////
    app.get('/api/s_ox_users_order_ch04/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch04 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-5 /////////////
    app.get('/api/s_ox_users_order_ch05/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch05 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-6 /////////////
    app.get('/api/s_ox_users_order_ch06/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch06 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-7 /////////////
    app.get('/api/s_ox_users_order_ch07/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch07 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-8 /////////////
    app.get('/api/s_ox_users_order_ch08/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch08 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-9 /////////////
    app.get('/api/s_ox_users_order_ch09/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch09 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-10 /////////////
    app.get('/api/s_ox_users_order_ch10/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch10 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-11 /////////////
    app.get('/api/s_ox_users_order_ch11/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch11 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });

    ///////////// OX Chapter-12 /////////////
    app.get('/api/s_ox_users_order_ch12/read/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var sql = 'SELECT * FROM s_ox_users_order_ch12 WHERE user_id = ?';
            const [rows] = await conn.query(sql, type);
            res.json(rows);

        } catch(err) {
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release(); // Return connection
        }
    });
}
read_ox_order()


///////////// (Table ID : s_ox_users_order_ch01~12) Update OX ///////////////////////////
// ** Sequence 
// 1 Step : update OX order table 0 to 5
// 2 Step : update OX result of answer table 0 or 1 (1 is collect answer, 0 is wrong answer) 
// 3 Step : update OX learning volume table by counting the number of times learned
// ** URL : http://13.124.19.61:3001/api/s_ox_users_order_ch01/update/:type (type : user_id )
function update_ox1() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_order_ch01/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch01_q" + q_num;               // Question Number String (ox_ch01_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch01";  // Table ID String (s_ox_users_s1~s5_ch01)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch01 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch01 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch01";  // Table ID String (s_ox_users_s1~s5_ch01)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch01 ' +
            'JOIN s_ox_users_s2_ch01 ON s_ox_users_s2_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
            'JOIN s_ox_users_s3_ch01 ON s_ox_users_s3_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
            'JOIN s_ox_users_s4_ch01 ON s_ox_users_s4_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
            'JOIN s_ox_users_s5_ch01 ON s_ox_users_s5_ch01.user_id = s_ox_users_s1_ch01.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch01.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch01 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-2 /////////////
    app.put('/api/s_ox_users_order_ch02/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch02_q" + q_num;               // Question Number String (ox_ch02_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch02";  // Table ID String (s_ox_users_s1~s5_ch02)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch02 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch02 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch02";  // Table ID String (s_ox_users_s1~s5_ch02)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch02 ' +
            'JOIN s_ox_users_s2_ch02 ON s_ox_users_s2_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
            'JOIN s_ox_users_s3_ch02 ON s_ox_users_s3_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
            'JOIN s_ox_users_s4_ch02 ON s_ox_users_s4_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
            'JOIN s_ox_users_s5_ch02 ON s_ox_users_s5_ch02.user_id = s_ox_users_s1_ch02.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch02.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch02 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-3 /////////////
    app.put('/api/s_ox_users_order_ch03/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch03_q" + q_num;               // Question Number String (ox_ch03_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch03";  // Table ID String (s_ox_users_s1~s5_ch03)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch03 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch03 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch03";  // Table ID String (s_ox_users_s1~s5_ch03)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch03 ' +
            'JOIN s_ox_users_s2_ch03 ON s_ox_users_s2_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
            'JOIN s_ox_users_s3_ch03 ON s_ox_users_s3_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
            'JOIN s_ox_users_s4_ch03 ON s_ox_users_s4_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
            'JOIN s_ox_users_s5_ch03 ON s_ox_users_s5_ch03.user_id = s_ox_users_s1_ch03.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch03.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch03 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-4 /////////////
    app.put('/api/s_ox_users_order_ch04/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch04_q" + q_num;               // Question Number String (ox_ch04_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch04";  // Table ID String (s_ox_users_s1~s5_ch04)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch04 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch04 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch04";  // Table ID String (s_ox_users_s1~s5_ch04)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch04 ' +
            'JOIN s_ox_users_s2_ch04 ON s_ox_users_s2_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
            'JOIN s_ox_users_s3_ch04 ON s_ox_users_s3_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
            'JOIN s_ox_users_s4_ch04 ON s_ox_users_s4_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
            'JOIN s_ox_users_s5_ch04 ON s_ox_users_s5_ch04.user_id = s_ox_users_s1_ch04.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch04.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch04 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-5 /////////////
    app.put('/api/s_ox_users_order_ch05/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch05_q" + q_num;               // Question Number String (ox_ch05_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch05";  // Table ID String (s_ox_users_s1~s5_ch05)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch05 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch05 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch05";  // Table ID String (s_ox_users_s1~s5_ch05)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch05 ' +
            'JOIN s_ox_users_s2_ch05 ON s_ox_users_s2_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
            'JOIN s_ox_users_s3_ch05 ON s_ox_users_s3_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
            'JOIN s_ox_users_s4_ch05 ON s_ox_users_s4_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
            'JOIN s_ox_users_s5_ch05 ON s_ox_users_s5_ch05.user_id = s_ox_users_s1_ch05.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch05.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch05 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-6 /////////////
    app.put('/api/s_ox_users_order_ch06/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch06_q" + q_num;               // Question Number String (ox_ch06_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch06";  // Table ID String (s_ox_users_s1~s5_ch06)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch06 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch06 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch06";  // Table ID String (s_ox_users_s1~s5_ch06)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch06 ' +
            'JOIN s_ox_users_s2_ch06 ON s_ox_users_s2_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
            'JOIN s_ox_users_s3_ch06 ON s_ox_users_s3_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
            'JOIN s_ox_users_s4_ch06 ON s_ox_users_s4_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
            'JOIN s_ox_users_s5_ch06 ON s_ox_users_s5_ch06.user_id = s_ox_users_s1_ch06.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch06.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch06 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });
    
    ///////////// OX Chapter-7 /////////////
    app.put('/api/s_ox_users_order_ch07/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch07_q" + q_num;               // Question Number String (ox_ch07_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch07";  // Table ID String (s_ox_users_s1~s5_ch07)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch07 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch07 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch07";  // Table ID String (s_ox_users_s1~s5_ch07)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch07 ' +
            'JOIN s_ox_users_s2_ch07 ON s_ox_users_s2_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
            'JOIN s_ox_users_s3_ch07 ON s_ox_users_s3_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
            'JOIN s_ox_users_s4_ch07 ON s_ox_users_s4_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
            'JOIN s_ox_users_s5_ch07 ON s_ox_users_s5_ch07.user_id = s_ox_users_s1_ch07.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch07.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch07 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-8 /////////////
    app.put('/api/s_ox_users_order_ch08/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch08_q" + q_num;               // Question Number String (ox_ch08_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch08";  // Table ID String (s_ox_users_s1~s5_ch08)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch08 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch08 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch08";  // Table ID String (s_ox_users_s1~s5_ch08)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch08 ' +
            'JOIN s_ox_users_s2_ch08 ON s_ox_users_s2_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
            'JOIN s_ox_users_s3_ch08 ON s_ox_users_s3_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
            'JOIN s_ox_users_s4_ch08 ON s_ox_users_s4_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
            'JOIN s_ox_users_s5_ch08 ON s_ox_users_s5_ch08.user_id = s_ox_users_s1_ch08.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch08.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch08 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-9 /////////////
    app.put('/api/s_ox_users_order_ch09/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch09_q" + q_num;               // Question Number String (ox_ch09_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch09";  // Table ID String (s_ox_users_s1~s5_ch09)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch09 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch09 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch09";  // Table ID String (s_ox_users_s1~s5_ch09)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch09 ' +
            'JOIN s_ox_users_s2_ch09 ON s_ox_users_s2_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
            'JOIN s_ox_users_s3_ch09 ON s_ox_users_s3_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
            'JOIN s_ox_users_s4_ch09 ON s_ox_users_s4_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
            'JOIN s_ox_users_s5_ch09 ON s_ox_users_s5_ch09.user_id = s_ox_users_s1_ch09.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch09.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch09 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-10 /////////////
    app.put('/api/s_ox_users_order_ch10/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch10_q" + q_num;               // Question Number String (ox_ch10_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch10";  // Table ID String (s_ox_users_s1~s5_ch10)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch10 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch10 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch10";  // Table ID String (s_ox_users_s1~s5_ch10)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch10 ' +
            'JOIN s_ox_users_s2_ch10 ON s_ox_users_s2_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
            'JOIN s_ox_users_s3_ch10 ON s_ox_users_s3_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
            'JOIN s_ox_users_s4_ch10 ON s_ox_users_s4_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
            'JOIN s_ox_users_s5_ch10 ON s_ox_users_s5_ch10.user_id = s_ox_users_s1_ch10.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch10.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch10 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-11 /////////////
    app.put('/api/s_ox_users_order_ch11/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch11_q" + q_num;               // Question Number String (ox_ch11_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch11";  // Table ID String (s_ox_users_s1~s5_ch11)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch11 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch11 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch11";  // Table ID String (s_ox_users_s1~s5_ch11)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch11 ' +
            'JOIN s_ox_users_s2_ch11 ON s_ox_users_s2_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
            'JOIN s_ox_users_s3_ch11 ON s_ox_users_s3_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
            'JOIN s_ox_users_s4_ch11 ON s_ox_users_s4_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
            'JOIN s_ox_users_s5_ch11 ON s_ox_users_s5_ch11.user_id = s_ox_users_s1_ch11.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch11.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch11 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-12 /////////////
    app.put('/api/s_ox_users_order_ch12/update/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch12_q" + q_num;               // Question Number String (ox_ch12_q1~q40)
            var t_string = "s_ox_users_s" + order_t + "_ch12";  // Table ID String (s_ox_users_s1~s5_ch12)

            // Date String (ex. 2022_11)
            let today = new Date();
            let year = today.getFullYear();        // Get the value of 'year'
            let month = today.getMonth() + 1;      // Get the value of 'month'
            var date_string = year + "_" + month;  // Get the string of 'date'

            await conn.beginTransaction();

            // Update order table
            var sqlA = 'UPDATE s_ox_users_order_ch12 SET ??=??%5+1 WHERE user_id=?'; // order : 1 -> 2 -> 3 -> 4 -> 5 -> 1 ...
            var paramsA = [qst_string, qst_string, type]
            const [rowsA] = await conn.query(sqlA, paramsA);
            
            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch12 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
                console.log('order number : %d', order_t, " order number doesn't match!!");
            }
            else {
                console.log('order number : %d', order_t, " order number does match");
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch12";  // Table ID String (s_ox_users_s1~s5_ch12)

            // Update result of answer table
            var sqlB = 'UPDATE s_ox_users_s1_ch12 ' +
            'JOIN s_ox_users_s2_ch12 ON s_ox_users_s2_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
            'JOIN s_ox_users_s3_ch12 ON s_ox_users_s3_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
            'JOIN s_ox_users_s4_ch12 ON s_ox_users_s4_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
            'JOIN s_ox_users_s5_ch12 ON s_ox_users_s5_ch12.user_id = s_ox_users_s1_ch12.user_id ' +
            'SET ??.??=? WHERE s_ox_users_s1_ch12.user_id=?';
            var paramsB = [t_string, qst_string, solve_r, type]
            const [rowsB] = await conn.query(sqlB, paramsB);
            
            // Update learning volume table
            var sqlC = 'UPDATE s_ox_users_vol_ch12 SET ??=??+1 WHERE user_id=?';
            var paramsC = [date_string, date_string, type]
            const [rowsC] = await conn.query(sqlC, paramsC);

            await conn.commit();
            res.json(rowsC);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });
}
update_ox1()
// !! HTTP requst URL/BODY
/*
{
    "q_num": 1,
    "order_t": 1,
    "solve_r": 1
}
*/


///////////// (Table ID : s_ox_users_order_ch01~12) Update OX (Statistics) ///////////////////////////
// ** Sequence
// 1 Step : read OX result of answer 1st ~ 4nd
// 2 Step : calculate the weight
// 3 Step : read OX correct answer rate
// 4 Step : calculate the unit score
// 5 Step : calculate and update the score
// ** URL : http://13.124.19.61:3001/api/s_ox_users_order_ch01/update2/:type (type : user_id )
function update_ox2() {
    ///////////// OX Chapter-1 /////////////
    app.put('/api/s_ox_users_order_ch01/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch01_q" + q_num;               // Question Number String (ox_ch01_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch01 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch01";  // Table ID String (s_ox_users_s1~s5_ch01)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch01";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch01 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch01 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch01;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch01=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-2 /////////////
    app.put('/api/s_ox_users_order_ch02/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch02_q" + q_num;               // Question Number String (ox_ch02_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch02 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch02";  // Table ID String (s_ox_users_s1~s5_ch02)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch02";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch02 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch02 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch02;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch02=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-3 /////////////
    app.put('/api/s_ox_users_order_ch03/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch03_q" + q_num;               // Question Number String (ox_ch03_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch03 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch03";  // Table ID String (s_ox_users_s1~s5_ch03)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch03";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch03 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch03 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch03;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch03=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-4 /////////////
    app.put('/api/s_ox_users_order_ch04/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch04_q" + q_num;               // Question Number String (ox_ch04_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch04 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch04";  // Table ID String (s_ox_users_s1~s5_ch04)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch04";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch04 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch04 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch04;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch04=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-5 /////////////
    app.put('/api/s_ox_users_order_ch05/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch05_q" + q_num;               // Question Number String (ox_ch05_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch05 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch05";  // Table ID String (s_ox_users_s1~s5_ch05)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch05";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch05 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch05 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch05;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch05=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-6 /////////////
    app.put('/api/s_ox_users_order_ch06/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch06_q" + q_num;               // Question Number String (ox_ch06_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch06 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch06";  // Table ID String (s_ox_users_s1~s5_ch06)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch06";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch06 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch06 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch06;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch06=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-7 /////////////
    app.put('/api/s_ox_users_order_ch07/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch07_q" + q_num;               // Question Number String (ox_ch07_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch07 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch07";  // Table ID String (s_ox_users_s1~s5_ch07)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch07";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch07 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch07 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch07;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch07=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-8 /////////////
    app.put('/api/s_ox_users_order_ch08/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch08_q" + q_num;               // Question Number String (ox_ch08_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch08 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch08";  // Table ID String (s_ox_users_s1~s5_ch08)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch08";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch08 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch08 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch08;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch08=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-9 /////////////
    app.put('/api/s_ox_users_order_ch09/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch09_q" + q_num;               // Question Number String (ox_ch09_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch09 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch09";  // Table ID String (s_ox_users_s1~s5_ch09)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch09";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch09 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch09 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch09;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch09=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-10 /////////////
    app.put('/api/s_ox_users_order_ch10/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch10_q" + q_num;               // Question Number String (ox_ch10_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch10 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch10";  // Table ID String (s_ox_users_s1~s5_ch10)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch10";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch10 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch10 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch10;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch10=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-11 /////////////
    app.put('/api/s_ox_users_order_ch11/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch11_q" + q_num;               // Question Number String (ox_ch11_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch11 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch11";  // Table ID String (s_ox_users_s1~s5_ch11)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch11";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch11 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch11 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch11;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch11=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });

    ///////////// OX Chapter-12 /////////////
    app.put('/api/s_ox_users_order_ch12/update2/:type', async(req, res) => {
        const conn = await pool.getConnection(async conn => conn);
        try {
            let {type} = req.params;
            var q_num = req.body.q_num;                         // Question Number (value : 1, 2, 3, 4 ... n)
            var order_t = req.body.order_t;                     // Order Number (value : 1, 2, 3, 4, 5)
            var solve_r = req.body.solve_r;                     // Result of Answer (value : 1 / 0)
            var qst_string = "ox_ch12_q" + q_num;               // Question Number String (ox_ch12_q1~q40)
            var answerArray_int = new Array();                  // Array for temporary save of the result of answer.

            await conn.beginTransaction();

            // Read order info. and match (To verify that the value of client matches the server)
            var sql = 'SELECT ?? AS s_order_t FROM s_ox_users_order_ch12 WHERE user_id = ?';
            var params = [qst_string, type]
            const [rows] = await conn.query(sql, params);
            if(order_t != rows[0].s_order_t) {
                order_t = rows[0].s_order_t;
            }
            else {
            }  // The order number is only from server DB!!
            var t_string = "s_ox_users_s" + order_t + "_ch12";  // Table ID String (s_ox_users_s1~s5_ch12)

            // Calculation of the weight
            // ** weight = answer result(1st) x 4 + answer result(2nd) x 2 + answer result(3nd)
            //   (A range of weight is from 0 to 7)
            //   (1st -> 2nd -> 3nd > 4nd is ... in the order of most recently entered values)
            // ** Alpha value : Calibration value of unit score (0 ~0.7)
            // ** unit score = weight x [Alphavalue + (1 - answer rate) x (1 - Alphavalue)]
            //   (A range of [] value is from Alphavalue(min.) to 1.0)
            // ** score = score - unit Score(#Before) + unit Score(#After)
            for(i=0; i<4; i++) {
                var order_t = order_t >0 ? order_t : 5;
                var answerTableNum = "s_ox_users_s" + order_t + "_ch12";
                var sqlA = 'SELECT ?? AS answerResult FROM ?? WHERE user_id = ?';
                var paramsA = [qst_string, answerTableNum, type]
                const [rowsA] = await conn.query(sqlA, paramsA);

                answerArray_int[i] = rowsA[0].answerResult != null ? rowsA[0].answerResult.readInt8() : 0; // byte -> integer
                order_t = order_t - 1;
            }

            // Weight
            var afterWeight = answerArray_int[0]*4 + answerArray_int[1]*2 + answerArray_int[2];  // Calculate a current value
            var beforeWeight = answerArray_int[1]*4 + answerArray_int[2]*2 + answerArray_int[3]; // Calculate a previous value

            // Read correct answer rate
            var sqlB = 'SELECT ox_avr FROM s_ox_qs_ansr_ch12 WHERE qst_id = ?';
            var paramsB = [qst_string]
            const [rowsB] = await conn.query(sqlB, paramsB);
            var Alphavalue = 0.6;          // Alpha value
            var AnsRate = rowsB[0].ox_avr != null ? rowsB[0].ox_avr : 0; // Answer rate

            // Unit score
            var afterUnitscore = afterWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue));   // Calculate a current value
            var beforeUnitscore = beforeWeight * (Alphavalue + (1 - AnsRate) * (1 - Alphavalue)); // Calculate a previous value
            var Unitscore = afterUnitscore - beforeUnitscore;                                     // Calculate a total value

            // Update score
            var sqlC = 'SELECT ch12 FROM s_stat_users_ch_score WHERE user_id = ?';
            const [rowsC] = await conn.query(sqlC, type);
            var score = rowsC[0].ch12;
            console.log(score, " ", afterUnitscore, " ", beforeUnitscore, " ", Unitscore);
            score = score + Unitscore; // Calculate a score
            var sqlD = 'UPDATE s_stat_users_ch_score SET ch12=? WHERE user_id=?';
            var paramsD = [score, type]
            const [rowsD] = await conn.query(sqlD, paramsD);

            await conn.commit();
            res.json(rowsD);

        } catch(err) {
            await conn.rollback();
            console.log(err);
            res.status(500).json({message: err.message});
        } finally {
            conn.release();
        }
    });
}
update_ox2()
// !! HTTP requst URL/BODY
/*
{
    "q_num": 1,
    "order_t": 1,
    "solve_r": 1
}
*/


///////////// (Table ID : s_ox_qs_ansr_ch01~12) Update OX Statistics (Add up the number of correct/wrong answers) ///////////////////////////
// ** Sequence
// 1 Step : Read the ratio of correct/wrong answer -> Calculation 
// 2 Step : update OX solving result (sum of correct/wrong answer)
// function name : trigger_ox_OsumResult
async function trigger_ox_OsumResult() {
    const conn = await pool.getConnection(async conn => conn);
    try {
        var ox_ch_count = 12;   // OX total number of chapters
        var ox_qst_count = 40;  // OX number of question per chapter
        var ox_ans_count = 5;   // OX order of answers
        var user_lv_count = 5;  // Learing level (Lv1. ~ Lv5.)

        await conn.beginTransaction();

        // number of chapter (12) x number of question (40) x number of order (5) x number of learning level (5) = 12,000
        for(var i=1; i<=ox_ch_count; i++){
            let ch_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i;          // to select a chapter from DB table (Table ID: s_ox_qs_ansr_ch01~ch12)
            for(var j=1; j<=ox_qst_count; j++){
                let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j;   // to select a question from table column (Column : ox_ch01(ch12)_q1~q40)
                for(var k=1; k<=user_lv_count; k++){
                    var lv_string = "l" + k + "_o_sum";                                     // to select a learing level (lv.1~lv.5)
                    var qst5_sum = 0;                                                       // Initialize a variable
                    for(var l=1; l<=ox_ans_count; l++){
                        var table_string = i<10 ? "s_ox_users_s" + l + "_ch0" + i : "s_ox_users_s" + l + "_ch" + i; // to select answer result (Table ID: s_ox_user_s1(s5)_ch01~ch12)

                        // calculate the number of correct answers
                        var sqlA = 'SELECT COUNT(*) AS sumCount FROM ?? '
                        + 'JOIN s_users_id_info ON s_users_id_info.user_id = ??.user_id '
                        + 'WHERE ?? = 1 AND s_users_id_info.level = ?';
                        var paramsA = [table_string, table_string, qst_string, k]
                        const [rowsA] = await conn.query(sqlA, paramsA);
                        qst5_sum = qst5_sum + rowsA[0].sumCount;
                    }
                    
                    // Update the number of correct answers
                    var sqlB = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                    var paramsB = [ch_string, lv_string, qst5_sum, qst_string]
                    const [rowsB] = await conn.query(sqlB, paramsB);
                    // console.log(ch_string + "_" + lv_string + "_" + qst_string + "_ : " + qst5_sum); // log ()
                }
            }
        }
        await conn.commit();
        console.log("trigger_ox_OsumResult is end");

    } catch(err) {
        await conn.rollback();
        console.log(err);
    } finally {
        conn.release();
    }
}

// function name : trigger_ox_XsumResult
async function trigger_ox_XsumResult() {
    const conn = await pool.getConnection(async conn => conn);
    try {
        var ox_ch_count = 12;   // OX total number of chapters
        var ox_qst_count = 40;  // OX number of question per chapter
        var ox_ans_count = 5;   // OX order of answers
        var user_lv_count = 5;  // Learing level (Lv1. ~ Lv5.)

        await conn.beginTransaction();

        // number of chapter (12) x number of question (40) x number of order (5) x number of learning level (5) = 12,000
        for(var i=1; i<=ox_ch_count; i++){
            let ch_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i;          // to select a chapter from DB table (Table ID: s_ox_qs_ansr_ch01~ch12)
            for(var j=1; j<=ox_qst_count; j++){
                let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j;   // to select a question from table column (Column : ox_ch01(ch12)_q1~q40)
                for(var k=1; k<=user_lv_count; k++){
                    var lv_string = "l" + k + "_x_sum";                                     // to select a learing level (lv.1~lv.5)
                    var qst5_sum = 0;                                                       // Initialize a variable
                    for(var l=1; l<=ox_ans_count; l++){
                        var table_string = i<10 ? "s_ox_users_s" + l + "_ch0" + i : "s_ox_users_s" + l + "_ch" + i; // to select answer result (Table ID: s_ox_user_s1(s5)_ch01~ch12)

                    // calculate the number of correct answers 
                        var sqlA = 'SELECT COUNT(*) AS sumCount FROM ?? '
                        + 'JOIN s_users_id_info ON s_users_id_info.user_id = ??.user_id '
                        + 'WHERE ?? = 0 AND s_users_id_info.level = ?';
                        var paramsA = [table_string, table_string, qst_string, k]
                        const [rowsA] = await conn.query(sqlA, paramsA);
                        qst5_sum = qst5_sum + rowsA[0].sumCount;
                    }
                    
                    // Update the number of correct answers
                    var sqlB = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                    var paramsB = [ch_string, lv_string, qst5_sum, qst_string]
                    const [rowsB] = await conn.query(sqlB, paramsB);
                    // console.log(ch_string + "_" + lv_string + "_" + qst_string + "_ : " + qst5_sum); // log ()
                }
            }
        }
        await conn.commit();
        console.log("trigger_ox_XsumResult is end");

    } catch(err) {
        await conn.rollback();
        console.log(err);
    } finally {
        conn.release();
    }
}


async function trigger_ox_AvrResult() {
    const conn = await pool.getConnection(async conn => conn);
    try {
        var ox_ch_count = 12;   // OX total number of chapters
        var ox_qst_count = 40;  // OX number of question per chapter
        var user_lv_count = 5;  // Learing level (Lv1. ~ Lv5.)

        for(var i=1; i<=ox_ch_count; i++){
            let table_string = i<10 ? "s_ox_qs_ansr_ch0" + i : "s_ox_qs_ansr_ch" + i;      // to select a chapter from DB table (Table ID: s_ox_qs_ansr_ch01~ch12)
            for(var j=1; j<=ox_qst_count; j++){
                let qst_string = i<10 ? "ox_ch0" + i + "_q" + j : "ox_ch" + i + "_q" + j;  // to select a question from table column (Column : ox_ch01(ch12)_q1~q40)
                var avrOsum = 0;                                                       // Initialize a variable
                var avrXsum = 0;                                                       // Initialize a variable
                for(var k=1; k<=user_lv_count; k++){
                    var lvOsum_string = "l" + k + "_o_sum";                                   // to select a learing level (lv.1~lv.5)
                    var lvXsum_string = "l" + k + "_x_sum";                                   // to select a learing level (lv.1~lv.5)
                    var lvSum_string = "l" + k + "_ox_avr";                                  // to select a learing level (lv.1~lv.5)
                    
                    // Read the number of correct/wrong answers 
                    var sqlA = 'SELECT ?? AS Osum, ?? AS Xsum FROM ?? WHERE qst_id = ?';
                    var paramsA = [lvOsum_string, lvXsum_string, table_string, qst_string]
                    const [rowsA] = await conn.query(sqlA, paramsA);
                    avrOsum = avrOsum + rowsA[0].Osum;
                    avrXsum = avrXsum + rowsA[0].Xsum;

                    var qAvr = rowsA[0].Osum + rowsA[0].Xsum != 0 ? rowsA[0].Osum / (rowsA[0].Osum +rowsA[0].Xsum) : null;
                    var qAvr_prec = qAvr != null ? Math.ceil(qAvr*100)/100 : null;

                    // Update the correct answer rate
                    var sqlB = 'UPDATE ?? SET ??=? WHERE qst_id=?'
                    var paramsB = [table_string, lvSum_string, qAvr_prec, qst_string]
                    const [rowsB] = await conn.query(sqlB, paramsB);
                }
                // Update the number of correct/wrong answers, correct answer rate (total)
                var QAvr = avrOsum + avrXsum != 0 ? avrOsum / (avrOsum + avrXsum) : null;
                var QAvr_prec = QAvr != null ? Math.ceil(QAvr*100)/100 : null;
                var sqlC = 'UPDATE ?? SET o_sum=?, x_sum=?, ox_avr=? WHERE qst_id=?'
                var paramsC = [table_string, avrOsum, avrXsum, QAvr_prec, qst_string]
                const [rowsC] = await conn.query(sqlC, paramsC);
            }
        }
        await conn.commit();
        console.log("trigger_ox_AvrResult is end");

    } catch(err) {
        await conn.rollback();
        console.log(err);
    } finally {
        conn.release();
    }         
}

trigger_ox_OsumResult();
trigger_ox_XsumResult();
trigger_ox_AvrResult();


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

