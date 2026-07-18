const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

// 深度融合您配置表压缩包中的核心解析组件
const excelconvert = require('./excelconvert/excelconvert');

const app = express();
const PORT = process.env.PORT || 3000;

// 全局路径矩阵
const CONFIG_DIR = path.join(__dirname, 'configs');
const EXCEL_DIR = path.join(__dirname, 'data_excel');
const DIST_DIR = path.join(__dirname, 'dist');

// 保证核心目录物理存在
fs.ensureDirSync(CONFIG_DIR);
fs.ensureDirSync(EXCEL_DIR);

// 复用您源码中 excel2json.js 的初始化基础设定
excelconvert.setDefaultTypeValue("number", 0);
excelconvert.setDefaultTypeValue("string", "");
excelconvert.setDefaultTypeValue("object", null);

app.use(cors());
app.use(bodyParser.json());
// 自动托管 dist 目录中的精美前端网页
app.use(express.static(DIST_DIR));

// ----------------- 路由配置 1: 配置文件拦截与多渠道分发 -----------------

// 保存渠道与公告配置 (后台调用)
app.post('/api/save-config', async (req, res) => {
    try {
        const { channel, params, notice } = req.body;
        if (!channel) return res.status(400).send({ code: 400, msg: '渠道 ID 缺失' });

        const filePath = path.join(CONFIG_DIR, `config_channel_${channel}.json`);
        await fs.writeJson(filePath, {
            lastUpdate: new Date().toLocaleString(),
            channel,
            params,
            notice
        }, { spaces: 2 });

        res.send({ code: 200, msg: '当前维度策略发布成功' });
    } catch (err) {
        res.status(500).send({ code: 500, msg: err.message });
    }
});

// 获取特定渠道配置 (面向游戏客户端)
app.get('/api/get-config/:channel', async (req, res) => {
    try {
        const channel = req.params.channel || '0';
        const filePath = path.join(CONFIG_DIR, `config_channel_${channel}.json`);

        if (!(await fs.pathExists(filePath))) {
            const defaultPath = path.join(CONFIG_DIR, 'config_channel_0.json');
            return res.json(await fs.pathExists(defaultPath) ? await fs.readJson(defaultPath) : {});
        }
        res.json(await fs.readJson(filePath));
    } catch (err) {
        res.status(500).send({ msg: 'Read Gateway Error' });
    }
});

// ----------------- 路由配置 2: 策划 Excel 接收暂存器 -----------------

const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, EXCEL_DIR),
    filename: (req, file, cb) => cb(null, file.originalname) // 保持策划原始表名，防联动破损
});

const uploadEncoder = multer({
    storage: excelStorage,
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.xlsx')) {
            cb(null, true);
        } else {
            cb(new Error('拒绝接收：系统只识别标准的 .xlsx 格式二进制表格。'));
        }
    }
});

app.post('/api/upload-excel', uploadEncoder.single('excelFile'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ code: 400, msg: '无有效数据流' });
        res.send({ code: 200, msg: `表格 ${req.file.originalname} 已成功布署至服务器暂存区！` });
    } catch (err) {
        res.status(500).send({ code: 500, msg: err.message });
    }
});

// ----------------- 路由配置 3: 原汁原味 excelconvert 编译流 -----------------

app.post('/api/convert-excel', async (req, res) => {
    try {
        let data = {};
        let files = await fs.readdir(EXCEL_DIR);
        // 严格过滤系统临时隐藏文件与非 xlsx 破损包
        let xlsxFiles = files.filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));

        if (xlsxFiles.length === 0) {
            return res.status(400).send({ code: 400, msg: '未在服务器 data_excel 目录内检测到任何可解析表格' });
        }

        // 串行执行您原厂的 addFileData 链条逻辑进行全量重构
        for (let file of xlsxFiles) {
            const buffer = await fs.readFile(path.join(EXCEL_DIR, file));
            let jsonData = excelconvert.convert(new Uint8Array(buffer)); // 调用底层 Wasm/解包器
            for (let tmp in jsonData) {
                data[tmp] = jsonData[tmp];
            }
        }

        // 输出无缩进、高紧凑、完美兼容 Cocos 的 design.json
        await fs.writeJson(path.join(CONFIG_DIR, 'design.json'), data);
        res.send({ code: 200, msg: `成功转化 ${xlsxFiles.length} 个策划表！design.json 核心已自动重写。` });
    } catch (err) {
        res.status(500).send({ code: 500, msg: '转化引擎破损', error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` 《末日特工队》生产环境控制中心已成功跑起来！`);
    console.log(` 服务端口: ${PORT}`);
    console.log(` 边缘网关地址: http://localhost:${PORT}`);
    console.log(`====================================================`);
});