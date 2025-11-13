const Parser = require('rss-parser');
const axios = require('axios');

// 创建 RSS 解析器
const parser = new Parser();

// 配置
const config = {
  rssFeedUrl: process.env.RSS_FEED_URL || 'https://example.com/rss',
  webhookUrl: process.env.WEBHOOK_URL || 'https://example.com/webhook',
  checkInterval: process.env.CHECK_INTERVAL || 300000 // 5分钟
};

// 存储已处理的项目ID，避免重复通知
const processedItems = new Set();

/**
 * 获取 RSS 更新
 */
async function checkRSSUpdates() {
  try {
    console.log('检查 RSS 更新...');
    
    const feed = await parser.parseURL(config.rssFeedUrl);
    
    console.log(`找到 ${feed.items.length} 个项目`);
    
    // 处理新项目
    for (const item of feed.items) {
      if (!processedItems.has(item.guid || item.link)) {
        console.log('发现新项目:', item.title);
        
        // 发送到 webhook
        await sendToWebhook(item);
        
        // 标记为已处理
        processedItems.add(item.guid || item.link);
      }
    }
    
    console.log('RSS 检查完成');
  } catch (error) {
    console.error('检查 RSS 时出错:', error.message);
  }
}

/**
 * 发送项目到 webhook
 */
async function sendToWebhook(item) {
  try {
    const webhookData = {
      title: item.title,
      link: item.link,
      content: item.contentSnippet || item.content,
      pubDate: item.pubDate,
      feed: 'RSS 订阅'
    };
    
    await axios.post(config.webhookUrl, webhookData);
    console.log('成功发送到 webhook:', item.title);
  } catch (error) {
    console.error('发送到 webhook 失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('RSS Webhook 处理器启动');
  console.log('配置:', {
    rssFeedUrl: config.rssFeedUrl,
    webhookUrl: config.webhookUrl,
    checkInterval: `${config.checkInterval / 1000} 秒`
  });
  
  // 立即检查一次
  await checkRSSUpdates();
  
  // 设置定时检查
  setInterval(checkRSSUpdates, config.checkInterval);
}

// 启动应用
main().catch(console.error);
