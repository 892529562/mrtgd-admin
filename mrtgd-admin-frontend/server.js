const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

// 深度引入您原厂压缩包内的核心表格转化引擎
const excelconvert = require('./excelconvert/excelconvert');

const app = express();
const PORT = process.env.PORT || 3000;

// 全栈路径定义矩阵
const CONFIG_DIR = path.join(__dirname, 'configs');
const EXCEL_DIR = path.join(__dirname, 'data_excel');
const DIST_DIR = path.join(__dirname, 'dist');

// 保证生产环境运行时核心逻辑文件夹物理存在
fs.ensureDirSync(CONFIG_DIR);
fs.ensureDirSync(EXCEL_DIR);

// 深度注入您原始 excel2json.js 的类型默认初始化设定
excelconvert.setDefaultTypeValue("number", 0);
excelconvert.setDefaultTypeValue("string", "");
excelconvert.setDefaultTypeValue("object", null);

app.use(cors());
app.use(bodyParser.json());

// 静态接管本地已经固化好的前端控制中心网页
app.use(express.static(DIST_DIR));

// ----------------- 路由配置 1: 策略参数热下发及公告分发 -----------------
app.post('/api/save-config', async (req, res) => {
    try {
        const { channel, params, notice } = req.body;
        if (!channel) return res.status(400).send({ code: 400, msg: 'Channel ID missing' });

        const filePath = path.join(CONFIG_DIR, `config_channel_${channel}.json`);
        await fs.writeJson(filePath, {
            lastUpdate: new Date().toLocaleString(),
            channel,
            params,
            notice
        }, { spaces: 2 });

        res.send({ code: 200, msg: '当前通道运营策略修改已全面广播生效！' });
    } catch (err) {
        res.status(500).send({ code: 500, msg: err.message });
    }
});

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
    filename: (req, file, cb) => cb(null, file.originalname)
});

const uploadEncoder = multer({
    storage: excelStorage,
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.xlsx')) {
            cb(null, true);
        } else {
            cb(new Error('拒绝格式：系统仅接受标准的 .xlsx 后缀策划表资产。'));
        }
    }
});

app.post('/api/upload-excel', uploadEncoder.single('excelFile'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ code: 400, msg: '空二进制数据流' });
        res.send({ code: 200, msg: `策划数据表 ${req.file.originalname} 已同步加载至服务器暂存区！` });
    } catch (err) {
        res.status(500).send({ code: 500, msg: err.message });
    }
});

// ----------------- 路由配置 3: 自动化解析引擎（深度同步您配置表压缩包源码） -----------------
app.post('/api/convert-excel', async (req, res) => {
    try {
        let data = {};
        let files = await fs.readdir(EXCEL_DIR);
        let xlsxFiles = files.filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));

        if (xlsxFiles.length === 0) {
            return res.status(400).send({ code: 400, msg: '云端暂存区内未发现任何可供重构的表格资产' });
        }

        for (let file of xlsxFiles) {
            const buffer = await fs.readFile(path.join(EXCEL_DIR, file));
            let jsonData = excelconvert.convert(new Uint8Array(buffer));
            for (let tmp in jsonData) {
                data[tmp] = jsonData[tmp];
            }
        }

        await fs.writeJson(path.join(CONFIG_DIR, 'design.json'), data);
        res.send({ code: 200, msg: `成功合并编译 ${xlsxFiles.length} 个策划表！云端 design.json 已经就绪。` });
    } catch (err) {
        res.status(500).send({ code: 500, msg: '表格转化核心发生异常断裂', error: err.message });
    }
});

// 通配兜底重定向，保障单页面应用前台路由刷新不白屏
app.get('*', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Administrative assets initialize failed. Please check if dist/index.html exists.');
    }
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` 🚀 《末日特工队》控制中心云端服务激活成功！`);
    console.log(`====================================================`);
});
