/**
 * 配置文件 - 存储API密钥和其他配置
 * ⚠️ 重要！对于生产环境：
 * 方案A（推荐）：使用其他后端服务（如Railway、Render等）来保护密钥
 * 方案B（临时）：让用户手动输入API密钥到localStorage中
 */

class Config {
    constructor() {
        this.storageKey = 'QIANWEN_API_KEY';
    }

    /**
     * 从localStorage获取API密钥
     */
    getApiKey() {
        return localStorage.getItem(this.storageKey);
    }

    /**
     * 设置API密钥到localStorage
     */
    setApiKey(apiKey) {
        localStorage.setItem(this.storageKey, apiKey);
        console.log('✓ API密钥已保存');
    }

    /**
     * 检查API密钥是否已设置
     */
    hasApiKey() {
        return !!this.getApiKey();
    }

    /**
     * 清除API密钥
     */
    clearApiKey() {
        localStorage.removeItem(this.storageKey);
        console.log('✓ API密钥已清除');
    }

    /**
     * 显示API密钥设置提示（开发时使用）
     */
    showSetupPrompt() {
        const apiKey = prompt('请输入你的 Qianwen API Key\n\n获取方法：\n1. 登录 https://dashscope.aliyuncs.com/\n2. 点击左侧"API-KEY"菜单\n3. 复制你的API Key（通常以 sk- 开头）');
        if (apiKey && apiKey.trim()) {
            this.setApiKey(apiKey.trim());
            return true;
        }
        return false;
    }
}

const config = new Config();
