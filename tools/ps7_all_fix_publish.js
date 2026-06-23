// PS7后台一次性修复+发布脚本
// 在浏览器控制台执行（需先登录后台）
// 功能：1.修复所有文章thumb 2.修复吉林文章乱码 3.发布5篇待发布文章

// === 辅助函数 ===
function getHeaders() {
    return {
        'Content-Type': 'application/json;',
        'i': document.cookie.match(/yzd_kp_uniacid=([^;]+)/)?.[1] || '',
        'token': document.cookie.match(/yzd_kp_token=([^;]+)/)?.[1] || '',
        'uid': document.cookie.match(/yzd_kp_uid=([^;]+)/)?.[1] || '',
        'version': 'V4.6.5',
        'mld': '0'
    };
}

async function apiCall(data) {
    const resp = await fetch('/public/index.php/api/admin/article', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return resp.json();
}

// === 第一部分：修复所有文章thumb字段 ===
async function fixAllThumbs() {
    console.log('=== 开始修复所有文章thumb字段 ===');
    let fixed = 0, checked = 0, page = 1;
    
    while (true) {
        try {
            const data = await apiCall({op: 'list', page: page, limit: 20});
            if (!data.data || !data.data.list || data.data.list.length === 0) break;
            
            for (const item of data.data.list) {
                checked++;
                const thumb = item.thumb || '';
                const img = item.img || '';
                
                if ((!thumb || thumb.trim() === '' || !thumb.startsWith('http')) && img && img.trim() !== '') {
                    const newThumb = 'https://wxdd386.ps7.cc/' + img;
                    const updateData = await apiCall({op: 'update', id: item.id, thumb: newThumb});
                    if (updateData.code === 1) {
                        fixed++;
                        console.log(`✅ thumb修复 [${item.id}] ${item.title}`);
                    } else {
                        console.log(`❌ thumb失败 [${item.id}] ${item.title}: ${updateData.msg}`);
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            page++;
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error('thumb修复出错:', e);
            break;
        }
    }
    console.log(`=== thumb修复完成：检查${checked}篇，修复${fixed}篇 ===`);
    return {checked, fixed};
}

// === 第二部分：修复吉林文章乱码 ===
async function fixJilinArticle() {
    console.log('=== 开始修复吉林文章乱码 ===');
    
    // 先查找吉林文章
    const data = await apiCall({op: 'list', page: 1, limit: 50});
    if (!data.data || !data.data.list) {
        console.log('❌ 无法获取文章列表');
        return;
    }
    
    const jilinArticle = data.data.list.find(a => a.title && a.title.includes('吉林'));
    if (!jilinArticle) {
        console.log('❌ 未找到吉林文章，尝试翻页查找...');
        // 翻页查找
        for (let p = 2; p <= 5; p++) {
            const pd = await apiCall({op: 'list', page: p, limit: 50});
            if (!pd.data || !pd.data.list || pd.data.list.length === 0) break;
            const found = pd.data.list.find(a => a.title && a.title.includes('吉林'));
            if (found) {
                fixJilinArticle.id = found.id;
                break;
            }
        }
    } else {
        fixJilinArticle.id = jilinArticle.id;
    }
    
    if (!fixJilinArticle.id) {
        console.log('❌ 未找到吉林研学文章');
        return;
    }
    
    console.log(`找到吉林文章ID: ${fixJilinArticle.id}`);
    
    const correctContent = '<p style="margin-bottom:16px;line-height:1.8">近日，吉林省文化和旅游厅联合省教育厅、省委宣传部、省科学技术协会、省人力资源和社会保障厅、省体育局印发《吉林省关于促进研学高质量发展的指导意见》（以下简称《指导意见》），推动教育与文旅深度融合，充分激发"研学+"新兴业态活力，加快文化强省、教育强省、旅游强省、冰雪强省建设。</p><p style="margin-bottom:16px;line-height:1.8"><strong>锚定2030年发展目标</strong></p><p style="margin-bottom:16px;line-height:1.8">《指导意见》明确了全省研学发展总体方向，提出坚持正确的价值导向、特色的发展方向、育人的发展理念和广泛的社会参与四大原则，锚定2030年发展目标，打造<strong>200个</strong>高品质研学基地，开发<strong>1000款</strong>优质研学课程产品，推出<strong>200条</strong>研学特色线路，"研学趣吉林"品牌影响力不断增强，逐步形成产品丰富、业态多样、管理规范、服务优质、市场活跃、安全有序、满意度高的研学发展新格局。</p><p style="margin-bottom:16px;line-height:1.8"><strong>丰富研学产品供给</strong></p><p style="margin-bottom:16px;line-height:1.8">培育一批主题鲜明、配套完善的高品质研学基地，建立动态准入与退出管理机制；打造兼具实践性、探究性的精品研学课程，强化课程知识产权保护与质量评估；重点打造<strong>"大美长白"线、"雪域奇缘"线、"大国重器"线、"电影流光"线、"红色记忆"线、"前沿科技"线、"逐梦蓝天"线、"吉韵非遗"线、边境国防线、"书香吉林行"</strong>等示范性研学线路，同时鼓励各地立足本地资源，开发一批"小而精"的区域性特色线路。</p><p style="margin-bottom:16px;line-height:1.8"><strong>激发研学消费潜力</strong></p><p style="margin-bottom:16px;line-height:1.8">培育推广"研学趣吉林"品牌，开展持续性、立体化的品牌形象推广，深化东北三省一区研学一体化合作，加强与京津冀、长三角、珠三角、川渝等客源市场的深度对接，把握长春大冬会等国际重大活动契机，开拓我国港澳台及国际学生研学市场。同时，推动研学与文创产业跨界融合，依托"礼遇吉林"文旅商品品牌，研发一批研学工具包、主题文创产品与旅游商品；推出专属消费补贴、支付优惠、积分奖励等促消费举措，探索发行区域性"研学消费卡"或"研学护照"，降低参与门槛，激发研学市场消费活力。</p><p style="margin-bottom:16px;line-height:1.8"><strong>服务提质与市场规范</strong></p><p style="margin-bottom:16px;line-height:1.8">在全省中小学范围内试点推广<strong>"每周半日实践"</strong>活动，推进研学与课后服务、综合实践课程深度融合，打造<strong>"15—30分钟步行研学圈"</strong>，开发一批高频、短时、就近的"微研学"课程和线路。加快构建覆盖研学基地、课程、指导师、服务、安全五大维度的标准体系，推行规范研学合同，强化平台内容监管，建立经营主体黑白名单动态管理制度，依托行业自律公约、信用体系建设，引导市场主体诚信合规经营。</p><p style="margin-bottom:16px;line-height:1.8"><strong>强化全链条保障体系</strong></p><p style="margin-bottom:16px;line-height:1.8">为保障政策落地，吉林同步强化全链条保障体系。健全多部门协同工作机制，吸纳教育专业力量参与研学标准、课程评价等工作；完善研学旅游指导师培养、认定体系，支持院校开设研学相关专业，夯实行业人才基础。统筹资金助力研学产业，深化政银企合作，推出适配研学产业的金融产品。同时严守安全底线，压实各方安全责任，严格落实行前勘察、应急预案等要求，配齐各类专职工作人员，规范出境研学管理，全方位筑牢安全屏障。</p>';
    
    const updateData = await apiCall({
        op: 'update',
        id: fixJilinArticle.id,
        content: correctContent
    });
    
    console.log(`吉林文章修复结果: code=${updateData.code}, msg=${updateData.msg}`);
    return updateData;
}

// === 第三部分：发布5篇待发布文章 ===
async function publishArticles() {
    console.log('=== 开始发布待发布文章 ===');
    
    const articles = [
        {
            title: '北京平谷东高村镇第三届南瓜丰收季启幕',
            type_id: '15399',
            desc: '6月17日，第八届中国（北京）休闲大会系列活动——平谷区东高村镇第三届南瓜丰收季在南埝头特菜基地启幕，持续至7月17日。活动整合农耕研学、科技赋能、药食同源等多元业态，园区引进30余种观赏南瓜品种，常态化承接中小学生社会大课堂研学实践，配套200米农业科普长廊与田间实操课程。',
            img: 'storage/upload/uniacid/2026/06/18/4428271781977710.jpg',
            thumb: 'https://wxdd386.ps7.cc/storage/upload/uniacid/2026/06/18/4428271781977710.jpg',
            content: '<p style="margin-bottom:16px;line-height:1.8">6月17日，第八届中国（北京）休闲大会系列活动——平谷区东高村镇第三届南瓜丰收季在南埝头特菜基地启幕，持续至7月17日。活动整合农耕研学、科技赋能、药食同源等多元业态，园区引进30余种观赏南瓜品种，常态化承接中小学生社会大课堂研学实践，配套200米农业科普长廊与田间实操课程。</p><p style="margin-bottom:16px;line-height:1.8">来源：<a href="https://www.beijing.gov.cn/ywdt/gqrd/202606/t20260618_4705968.html">首都之窗</a> | <a href="http://bj.xinhuanet.com/20260617/cd4a014b165d489e8fd45ad9f4eae6ea/c.html">新华网</a></p>'
        },
        {
            title: '央视调查研学游乱象：自然探索变荒野求生',
            type_id: '15399',
            desc: '暑期将至研学市场升温，央视新闻调查发现部分研学项目打着"自然探索"旗号实则违规探险，存在合同缺失、安全缺位等问题。研学旅游指导师新国标今年4月颁布，试图规范行业乱象。',
            img: 'storage/upload/uniacid/2026/06/21/1923860020746147.jpg',
            thumb: 'https://wxdd386.ps7.cc/storage/upload/uniacid/2026/06/21/1923860020746147.jpg',
            content: '<p style="margin-bottom:16px;line-height:1.8">暑期将至，研学游市场不断升温。然而央视新闻调查发现，部分亲子研学项目打着"自然探索"旗号，实则变成了"集体大冒险"——爬土路、挖水晶、钻山洞，安全隐患重重。记者调查发现，火爆的研学游背后藏着合同缺失、安全缺位等问题。</p><p style="margin-bottom:16px;line-height:1.8">数据显示，2025年全国研学旅行行业市场规模已突破2132亿元，2026年有望再创新高。然而研学游以未成年人为主，承办机构五花八门，有旅行社也有培训机构。有导游证的没有专业知识，有专业知识的没法签合同带团，价格虚高、资质不全等问题困扰着从业者和家长。</p><p style="margin-bottom:16px;line-height:1.8">好消息是，今年4月研学旅游指导师国家职业标准正式颁布，核心起草人、浙江旅游职业学院教授邓德智表示，新标准将课程设计、活动实施、安全管理、教学评价等七大职业功能作为核心骨架，以教育为本质属性、以旅游为载体，彻底区分导游和研学旅游指导师，让家长选团时有"看得见的标尺"。</p><p style="margin-bottom:16px;line-height:1.8">来源：<a href="http://m.toutiao.com/group/7653425323643601446/">央视新闻</a></p>'
        },
        {
            title: '研学旅游指导师国家职业标准出台，2.4万家企业告别"无标可依"',
            type_id: '15399',
            desc: '人社部与文旅部近日联合发布《研学旅游指导师国家职业标准》，首次从国家层面对该职业做出系统规范，设四个等级并明确培训学时。全国现有研学相关企业超2.4万家，此前长期处于"无标可依"状态。',
            img: 'storage/upload/uniacid/2026/06/21/3781340810182029.jpg',
            thumb: 'https://wxdd386.ps7.cc/storage/upload/uniacid/2026/06/21/3781340810182029.jpg',
            content: '<p style="margin-bottom:16px;line-height:1.8">人社部与文旅部近日联合发布《研学旅游指导师国家职业标准》，首次从国家层面对研学旅游指导师这个职业做出系统规范。按照官方定义，研学旅游指导师是指策划、制定、实施研学旅游方案，组织指导开展研学体验活动的人员。</p><p style="margin-bottom:16px;line-height:1.8">标准最核心的内容是划清了职业边界：等级共设四个级别，从低到高分别是中级工、高级工、技师、高级技师，对应培训学时也有硬性要求。课程方面，研学课程被分为课程单元、课程、课程体系三个层次，对课程目标、内容、评价等环节都作出明确要求——以后的研学课程需要有完整的教学设计和评价体系，而不只是简单的旅行加讲解。</p><p style="margin-bottom:16px;line-height:1.8">据天眼查数据显示，截至目前我国现存研学相关企业超过2.4万家，湖南、山东、广东三省数量位居全国前列。此行业长期处于"无标可依"状态，此次标准出台意味着行业进入了规范发展的新阶段。从业人员有了明确成长路径，用人单位有了清晰评价依据，消费者也有了判断服务质量的参考标尺。</p><p style="margin-bottom:16px;line-height:1.8">来源：<a href="http://m.toutiao.com/group/7653481446396494390/">央视新闻</a></p>'
        },
        {
            title: '研学旅行如何走出"只游不学"怪圈？重庆这所小学给出答案',
            type_id: '15399',
            desc: '重庆巴南区鱼洞第二小学创新构建"四维阳光"廉洁体系，四年累计开展研学35场覆盖2万余人次，实现研学"零投诉"，2025年家长与学生满意度双双达100%。',
            img: 'storage/upload/uniacid/2026/06/24/6113824237510504.jpg',
            thumb: 'https://wxdd386.ps7.cc/storage/upload/uniacid/2026/06/24/6113824237510504.jpg',
            content: '<p style="margin-bottom:16px;line-height:1.8">如何让研学旅行走出"只游不学"的怪圈，又守好廉洁底线？重庆市巴南区鱼洞第二小学校用四年实践给出答案。自2021年创新构建"四维阳光"廉洁体系以来，该校累计开展研学活动35场，覆盖学生2万余人次，实现研学活动"零投诉"。2025年，家长与学生满意度双双达到100%，学校经验已在全区教育系统推广。</p><p style="margin-bottom:16px;line-height:1.8">研学旅行本是综合实践育人的重要载体，但不少学校在操作中出现了重游玩轻实践、招投标不透明、经费监管缺位等问题。鱼洞二小在自查中发现，过去研学目标存在偏重"游玩体验"的倾向，服务机构招投标中廉洁记录与服务保障措施权重仅占10%，而报价权重高达60%，经费使用公示也不及时。</p><p style="margin-bottom:16px;line-height:1.8">为此，学校从决策、择商、经费、监督四个维度重构研学管理体系。在决策环节，建立"1+3+N"多元共议机制，由德体卫艺处统筹，年级组、教师代表、家委会三方协同，学生、社会监督员等多方参与议事。2021年以来，年级组年均审核研学流程5次，教师代表年均评估课程内容5轮，否决了3个不符合教育目标的方案。</p><p style="margin-bottom:16px;line-height:1.8">在服务机构遴选中，学校明确"准入红线"，要求投标机构签署廉洁承诺书，并通过微信公众号公开发布招标公告。2024年投标供应商达39家，较2022年增长69.2%。招标关键环节全程录音录像，由行政、教师、家长代表共同组成的评审小组独立打分。2025年春季招标中，最高分与最低分差值达23分。</p><p style="margin-bottom:16px;line-height:1.8">经费管理方面，学校推行预算清单化、执行动态化、决算审计化模式，引入第三方审计机构对经费使用进行专项审计。监督贯穿研学全程，事前联合审查、事中随行监督、事后15个工作日内开展廉洁评估。1家机构因整改不力被暂停合作。鱼洞二小相关负责人表示，研学旅行不仅是行走的课堂，更是行走的清廉课堂。</p><p style="margin-bottom:16px;line-height:1.8">来源：<a href="http://difang.gmw.cn/cq/2026-06/23/content_38843589.htm">光明网</a></p>'
        },
        {
            title: '绵阳举办研学旅游指导师技能培训暨技能竞赛',
            type_id: '15399',
            desc: '绵阳市文旅局组织举办研学旅游指导师技能培训暨技能竞赛，约50名从业人员参加，采取"理论教学+实践实操+技能竞赛"模式，为四川省研学指导师技能竞赛储备人才。',
            img: 'storage/upload/uniacid/2026/06/24/1545829746121903.jpg',
            thumb: 'https://wxdd386.ps7.cc/storage/upload/uniacid/2026/06/24/1545829746121903.jpg',
            content: '<p style="margin-bottom:16px;line-height:1.8">为进一步提升全市研学旅游人才队伍的专业素养和实操能力，近日，绵阳市文化广播电视和旅游局组织举办了全市研学旅游指导师技能培训暨技能竞赛，全市共约50名研学旅游行业相关从业人员参加培训。</p><p style="margin-bottom:16px;line-height:1.8">本次培训为期五天，于6月22日在梓潼县七曲山传统文化研学基地开班，将持续至6月26日。培训对象精准覆盖研学旅游产业链关键岗位，包含经营管理人员和研学旅游指导师两类人员。其中，经营管理人员涵盖全市各研学基地、营地及机构的负责人，研学旅游指导师则包括一线研学旅游从业人员、学校骨干教师、景区导游及讲解员等。</p><p style="margin-bottom:16px;line-height:1.8">培训期间，业内知名专家受邀进行专题授课，内容涵盖研学政策解读、课程创新开发、安全管理实务及现场教学技巧等。培训采取"理论教学+实践实操+技能竞赛"的模式，构建"学、练、演、评"闭环培育体系，重点提升参训人员的行业洞察能力、课程设计能力、现场教学能力与安全管控能力。</p><p style="margin-bottom:16px;line-height:1.8">通过"实训+竞赛"模式，实现学用结合、以赛促练，在强化专业技能的同时严格选拔优秀选手，为后续四川省研学旅游指导师技能竞赛储备和输送参赛人才。</p><p style="margin-bottom:16px;line-height:1.8">来源：<a href="https://m.weibo.cn/detail/5312983987126971">梓潼发布</a></p>'
        }
    ];
    
    let published = 0;
    for (const article of articles) {
        try {
            const data = await apiCall({
                op: 'add',
                title: article.title,
                type_id: article.type_id,
                desc: article.desc,
                img: article.img,
                thumb: article.thumb,
                img_list: [{img: article.img, thumb: article.thumb}],
                content: article.content,
                state: 1,
                style_type: 0
            });
            if (data.code === 1) {
                published++;
                console.log(`✅ 发布成功: ${article.title}`);
            } else {
                console.log(`❌ 发布失败: ${article.title} - ${data.msg}`);
            }
        } catch (e) {
            console.log(`❌ 发布出错: ${article.title} - ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log(`=== 发布完成：成功${published}/${articles.length}篇 ===`);
    return published;
}

// === 执行所有任务 ===
(async function runAll() {
    console.log('🚀 开始执行全部修复+发布任务');
    
    // 1. 修复thumb
    const thumbResult = await fixAllThumbs();
    
    // 2. 修复吉林文章
    const jilinResult = await fixJilinArticle();
    
    // 3. 发布5篇文章
    const publishResult = await publishArticles();
    
    console.log('🎉 全部任务执行完毕！');
    console.log(`thumb修复: ${thumbResult.fixed}/${thumbResult.checked}`);
    console.log(`吉林文章: code=${jilinResult?.code}`);
    console.log(`文章发布: ${publishResult}/5`);
})();
