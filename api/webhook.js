module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const tallyData = req.body;
      console.log('收到Tally数据:', tallyData);
      
      // 生成序号
      const nextId = 'NZ-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      res.status(200).json({ 
        status: 'success', 
        id: nextId,
        message: '数据接收成功',
        received_data: tallyData
      });
    } catch (error) {
      console.error('处理Webhook时出错:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  } else {
    // GET请求返回健康状态
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  }
};