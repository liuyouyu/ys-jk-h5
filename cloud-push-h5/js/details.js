$(function() {
	/**
	 * 图片预览
	 */
	function initImgPreview(s) {
		dazzleUtil.initImgPreview(s);
	}
	var docDetailPage = new Vue({
		el: '#details', //元素id
		data: {
			docid: dazzleUtil.getRequestValue("id") || "", //文章id
			authorId: '',
			mescroll: null, //下拉加载
			title: '', //网站标题
			gzState: true, //关注状态
			cTit: '', //标题
			cSource: '', //来源
			cDate: '', //日期
			cText: '', //内容
			cSee: '', //阅读
			cZan: '', //赞
			comentNum: '', //赞
			cZanState: false, //点赞状态
			comentEdit: false, //评论显示状态
			infoAlt: false, //信息弹窗
			altText: '', //弹窗文字
			comentList: false, //评论列表
			send: false, //发送
			comentText: '', //评论内容
			scrollTop: '', //页面滚动距离
			currentPage: 1, //当前页
			pageState: true, //分页状态
			currentList: [], //评论列表内容
			replyName: '', //回复
			beComId: "", //被评论人ID
			beComName: "", //被评论人名字
			beComImg: "", //被评论人头像
			doComId: "", //评论人ID
			doComName: "", //评论人名字
			doComImg: "", //评论人头像
			sysColor: '', //系统颜色
			loadingGifUrl: '',
			globalConfigData: {}, //全局配置数据
			logoData: { //logo设置
				show: 0,
				imgUrl: ''
			},
			stype: 'content', //计数接口用到的类型
			isCache: '', //yes 先审后发  no 先发后审
			loadMoreStatus: '', //上拉下拉状态  1上拉 2下拉
			downloadTips: false,
			isAllowComment: true, //是否允许评论 true: 允许, false: 不允许
			isBannedFan: false, //粉丝是否被禁言 true 禁言, false: 不禁言
			el1: '',
			dianzanCount: 0,
			zanThis: '',
			showReadNumDom: false, //是否显示
			isShowLoadImg: true,
			//素材视频信息
			videoData: {
                show: false,
                data: []
            },
			showNodataType: false, // 显示没有数据提示， 默认不显示
			relatedData: [],
			imgUrl: '../common/img/default_img.png', //懒加载默认底图（从全局配置中获取）
			colorfulInfo: {}, //媒体号信息
			fansAttentionStatus: "no", //当前关注媒体号状态
			docDetailPage : {},
			beCommenteItem: '', // 被评论的数组
			docItem: '', // 文章详情内容
			pvShow: 'yes', // 是否展示阅读量
      articleTime: ''//文章发布时间
		},
		methods: {
			//显示loadImg
			showLoadImg: function() {
				this.isShowLoadImg = true;
			},
			//隐藏loading图片
			hideLoadingImg: function() {
				var that = this;
				setTimeout(function() {
					that.isShowLoadImg = false;
				}, 100);
			},
			// 点赞动画
			init: function() {
				var that = this;
				// taken from mo.js demos
				function isIOSSafari() {
					var userAgent;
					userAgent = window.navigator.userAgent;
					return userAgent.match(/iPad/i) || userAgent.match(/iPhone/i);
				};
				// taken from mo.js demos
				function isTouch() {
					var isIETouch;
					isIETouch = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
					return [].indexOf.call(window, 'ontouchstart') >= 0 || isIETouch;
				};
				// taken from mo.js demos
				var isIOS = isIOSSafari(),
					clickHandler = isIOS || isTouch() ? 'touchstart' : 'click';

				function extend(a, b) {
					for(var key in b) {
						if(b.hasOwnProperty(key)) {
							a[key] = b[key];
						}
					}
					return a;
				}

				function Animocon(el, options) {
					this.el = el;
					this.options = extend({}, this.options);
					extend(this.options, options);

					this.checked = false; //默认开启点赞

					this.timeline = new mojs.Timeline();

					for(var i = 0, len = this.options.tweens.length; i < len; ++i) {
						this.timeline.add(this.options.tweens[i]);
					}

					var self = this;
					that.zanThis = this;
					this.el.addEventListener(clickHandler, function() {
						if(self.checked) {
							self.options.onUnCheck();
						} else {
							self.options.onCheck();
							self.timeline.start();
						}
						self.checked = !self.checked;
					});
				}

				Animocon.prototype.options = {
					tweens: [
						new mojs.Burst({
							shape: 'circle',
							isRunLess: true
						})
					],
					onCheck: function() {
						return true;
					},
					onUnCheck: function() {
						return false;
					}
				};

				// grid items:
				var items = [].slice.call(document.querySelectorAll('ol.grid > .grid__item'));

				function init() {
					/* Icon 1 */
					if(items.length > 0) {
						that.el1 = items[0].querySelector('button.icobutton'), el1span = that.el1.querySelector('span');

						new Animocon(that.el1, {
							tweens: [
								// burst animation
								new mojs.Burst({
									parent: that.el1,
									duration: 1700,
									shape: 'circle',
									fill: '#C0C1C3',
									x: '50%',
									y: '50%',
									opacity: 0.6,
									childOptions: {
										radius: {
											15: 0
										}
									},
									radius: {
										30: 90
									},
									count: 6,
									isRunLess: true,
									easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
								}),
								// ring animation
								new mojs.Transit({
									parent: that.el1,
									duration: 700,
									type: 'circle',
									radius: {
										0: 60
									},
									fill: 'transparent',
									stroke: '#C0C1C3',
									strokeWidth: {
										20: 0
									},
									opacity: 0.6,
									x: '50%',
									y: '50%',
									isRunLess: true,
									easing: mojs.easing.sin.out
								}),
								// icon scale animation
								new mojs.Tween({
									duration: 1200,
									onUpdate: function(progress) {
										if(progress > 0.3) {
											var elasticOutProgress = mojs.easing.elastic.out(1.43 * progress - 0.43);
											el1span.style.WebkitTransform = el1span.style.transform = 'scale3d(' + elasticOutProgress + ',' + elasticOutProgress + ',1)';
										} else {
											el1span.style.WebkitTransform = el1span.style.transform = 'scale3d(0,0,1)';
										}
									}
								})
							],
							// onCheck : function() {
							//     that.el1.style.color = '#988ADE';
							// },
							// onUnCheck : function() {
							//     that.el1.style.color = '#fff';	
							// }
						});
					}
					/* Icon 1 */
				}
				init();
			},
			//获取全局配置
			getGlobalConfig: function() {
				var that = this;
				var url = config.apiHost + "api/ffWxCheck/v1/queryAuthorizeTenantInfo?companyId=COMPANYID&appCode=APPCODE&userId=USERID&serviceCode=SERVICECODE";
					url = dazzleUtil.replaceUrlCommonParam(url);
				axios.get(url).then(function(res) {
					var data = that.checkReturn(res);
					if(data !== false && data.data) {
						//logo设置
//						if(that.globalConfigData.logo) {
//							that.logoData = that.globalConfigData.logo;
//						}
						xyAuth.init({
							appId: data.data.appId,
							componentAppId: data.data.componentAppId,
							domain: config.apiHost
						});
					}
					that.sysColor = that.DEFAULT_DATA.sysColor;
					that.loadingGifUrl = 'common/img/loading.gif';
					that.getDetails();
					that.newLazy(that.imgUrl);
				}).catch(function(e) {
					that.sysColor = that.DEFAULT_DATA.sysColor;
					that.loadingGifUrl = 'common/img/loading.gif';
					that.getDetails();
				});
			},
			// 页面滚动
			menu: function() {
				this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			},
			// 返回顶部
			returnTop: function() {
				$("html,body").animate({
					"scrollTop": 0
				});
			},
			// 关注
			clearGz: function() {
				this.gzState = false;
			},
			// 赞
			clickZan: function() {
				var that = this;
				if(!this.cZanState) {
					if(!xyAuth.getCacheUserInfo().auth) {
						layer.msg('游客不能点赞');
						return;
					}
					this.dianzanCount++;
					// this.el1.style.color = '#988ADE';
					if(this.dianzanCount == 1) {
						// setTimeout(function() {
						that.cZanState = true;
						that.dianzanCount = 0;
						// }, 900)
					}

				}
			},
			// 取消点赞
			cancelZan: function() {
				var that = this;
				if(this.cZanState) {
					if(!xyAuth.getCacheUserInfo().auth) {
						return;
					}
					this.dianzanCount++;
					if(this.dianzanCount == 1) {
						this.delZanNum(); //点赞数量-1
						this.delZanPushUp(); //新增点赞记录
						setTimeout(function() {
							that.dianzanCount = 0;
						}, 500)
					}

				}
			},
			// 点赞数减一
			delZanNum: function() {
				var that = this;
				var url = config.statisticsApi + "api/statistic/v1/addCount";
				var paramJson = {
					companyId: config.companyId,
					appCode: config.appCode,
					userId: xyAuth.getCacheUserInfo().id,
					beCountId: this.docid,
					beCountName: encodeURIComponent(encodeURIComponent(this.cTit)),
					type: "content",
					token: config.token,
					userName: encodeURIComponent(encodeURIComponent(xyAuth.getCacheUserInfo().nickname)),
					countType: 'support',
					num: -1,
				};
				axios.get(url, {
					params: paramJson
				}).then(function(res) {
					var data = that.checkReturn(res);
					if(data) {
						if(data.data.num < 0) {
							that.cZan = 0;
						} else {
							that.cZan = data.data.num;
						}
					}
				}).catch(function(e) {
					console.log(e);
				});
			},
			// 删除点赞记录
			delZanPushUp: function() {
				var that = this;
				var url = config.statisticsApi + 'COMPANYID/APPCODE/USERID/SERVICECODE/v2/pushUp/deletePushUp';
				url = dazzleUtil.replaceUrlCommonParam(url);
				url = url + '?docid=' + this.docid;
				var _data = {
					"accessToken": "true",
					"timeStamp": new Date().getTime(),
					"beLikeId": this.docid,
				};
				axios.post(url, _data).then(function(res) {
					var data = that.checkReturn(res);
					if(data !== false && data.data.influenceNum && data.data.influenceNum == 1) {
						that.cZanState = false;
					}
				}).catch(function(e) {
					console.log(e);
				});
			},
			// 评论
			toggleComent: function(doId, doName, doImg, beId, beName, item) {
				if(!this.isAllowComment) {
					if(!doId) {
						layer.msg('该文章暂不支持评论');
					}
					return;
				}
				if(xyAuth.getCacheUserInfo().status == 0) {
					if(!doId) {
						layer.msg('您已被禁止评论');
					}
					return;
				}
				if(doId) {
					this.beComId = doId;
					this.beComName = doName;
					this.replyName = '回复@' + doName;
				} else {
					this.beComId = "";
					this.beComName = "";
					this.replyName = "";
				}

				if (item) {
					this.beCommenteItem = item;
				} else {
					this.beCommenteItem = '';
				}

				this.doComId = xyAuth.getCacheUserInfo().id;
				this.doComName = xyAuth.getCacheUserInfo().nickname;
				this.doComImg = xyAuth.getCacheUserInfo().headimgurl;
				this.comentEdit = !this.comentEdit;
				if(this.comentEdit) {
					this.hideVideo();
				} else {
					this.showVideo();
				}
			},
			// 隐藏详情的video标签
			// hideVideo: function() {
			// 	$(this.$refs.detail_content).find('video').each(function() {
			// 		$(this).hide();
			// 	});
			// },
			// 显示详情页的video标签
			// showVideo: function() {
			// 	$(this.$refs.detail_content).find('video').each(function() {
			// 		$(this).show();
			// 	});
			// },
			// 提交信息并弹出提示弹窗
			promptPopup: function(txt, time) {
				if(!xyAuth.getCacheUserInfo().auth) {
					layer.msg('游客不能评论');
					return;
				}
				if($.trim(this.comentText)) {
					var _this = this;
					time ? time = time : time = 2000;
					if(this.isCache == 'yes') {
						txt = '评论成功,稍后可见';
					} else {
						txt = '评论成功,稍后可见';
					}
					_this.altText = txt;
					layer.msg(txt);
					_this.comentEdit = !_this.comentEdit;
					if(_this.comentEdit) {
						_this.hideVideo();
					} else {
						_this.showVideo();
					}
					// _this.toggleComent();
					setTimeout(function() {
						_this.infoAlt = false;
						_this.comentText = '';
					}, time);
				}
			},
			//这篇文章是否开启评论
			isAllowCommentFun: function() {
				var that = this;
				var url = this.setUrl('api/xy/toc/v1/queryArticleIsNoComment');
				var params = {
					'docids': [this.docid]
				};
				axios.post(url, params).then(function(res) {
					if(res.data && res.data.data.length) {
						that.isAllowComment = false
					}
				});
			},
			//查询粉丝是否禁言
			isBannedFanFun: function() {
				var that = this;
				var url = this.setUrl('api/xy/fans/v1/isBannedByWechatId');
				var params = {
					'wechatId': xyAuth.getCacheUserInfo().openid
				};
				axios.post(url, params).then(function(res) {
					if(res.data && res.data.data) {
						that.isBannedFan = true
					}
				});
			},
			// 关闭提交信息弹窗
			clearPopup: function() {
				this.toggleComent();
				this.comentText = '';
			},
			// 评论列表
			toggleList: function(state) {
				this.comentList = !this.comentList;
			},
			// 评论内容
			changeData: function() {
				if($.trim(this.comentText)) {
					this.send = true;
				} else {
					this.send = false;
				}
			},
			// 获取文章详情
			getDetails: function() {
				var that = this;
				var defaultImg = '../../common/img/default_img.png';
				var url = that.setUrl('api/release/catalogue/v1/queryCatalogueById');
				url += '&id=' + this.docid+'&versionId=v1';
				axios.get(url).then(function(res) {
					var data = that.checkReturn(res);
					console.log(data,"获取文章详情》》》");
					if(data.code === 2) {
						that.showNodataType = true;
						that.hideLoadingImg();
						return;
					}
					if(data !== false) {
					  console.log(data,"h5数据？？")
						var articleType = 1; // articleType: 0:动态 1：普通文稿 2：图集 3：视频
						if (data.data && data.data.articleType) {
							var articleType = data.data.articleType
						}
						that.docItem = data.data;
						window.addActionLogByShareData = data.data; // 分享统计使用
						document.title = data.data.title;
						that.cTit = data.data.title; //标题
            that.articleTime = data.data.ffPushTime;//时间
						if(data.data.hasOwnProperty('cibiao') && data.data.cibiao.length > 0 && data.data.cibiao[0]) {
							that.cSource = data.data.cibiao[0]; //词标
						} else {
							that.cSource = '';
						}
						that.cDate = data.data.ctime; //日期
						that.authorId = data.data.cuserId; //作者
						if(that.isNew == 'no') {
							that.authorId = data.data.userid;
						}

						that.cText = data.data.srcontent; //内容
						if (articleType == 3) { // 视频文稿
							var videos = data.data.videos || [];
							if(videos.length != 0) {
								that.videoData.show = true;
								var obj = {};
								if (!videos[0].vthumburl) {
									videos[0].vthumburl = defaultImg
								}
								obj.src = videos[0].vh5url;
								obj.poster = videos[0].vthumburl + "?" + config.compressNum._540;
								that.videoData.data.push(obj);
								if (videos[0].describe) {
									that.cText = videos[0].describe
								}
							}
						} else {
							//没有正文显示视频
							if(!that.cText) {
								var videos = data.data.videos || [];
								if(videos.length != 0) {
									that.videoData.show = true;
									var obj = {};
									if (!videos[0].vthumburl) {
										videos[0].vthumburl = defaultImg
									}
									obj.src = videos[0].vh5url;
									obj.poster = videos[0].vthumburl + "?" + config.compressNum._540;
									that.videoData.data.push(obj);
								}
							}
						}
						
						that.docDetailPage = that.globalConfigData.docDetailPage || {};
						//设置微信分享信息
						that.$nextTick(function() {
							var desc = "";
							var imgUrl = "";
							var globalShare = that.globalConfigData.share || {};
							if($(".articleCon").text().trim()) {
								desc = $(".articleCon").text().trim();
								if(desc.length > 200) {
									desc = desc.substr(0, 200);
								}
							}
							if(data.data.thumbnail) {
								imgUrl = data.data.thumbnail;
							}
							that.showReadNumDom = true;
							//微信分享
							var shareInfo = {
								title: $("title").text(),
								desc: desc,
								imgUrl: imgUrl
							};
							shareInfo = dazzleUtil.setWechatShareInfo(that.globalConfigData.share, shareInfo);
							xyAuth.setShareInfo({
								title: shareInfo.title,
								imgUrl: shareInfo.imgUrl,
								desc: shareInfo.desc
							});
							//app分享
							var appShare = {
								desc: xyAuth.shareInfo.desc,
								imgUrl: xyAuth.shareInfo.imgUrl,
								link: xyAuth.shareInfo.link,
								title: xyAuth.shareInfo.title
							};
							dazzleUtil.appShare(appShare);

							$('.articleCon').find('video').attr('controls', 'controls');
							$('.articleCon').find('video').attr('x5-playsinline', '');
							$('.articleCon').find('video').attr('playsinline', '');
							$('.articleCon').find('video').attr('webkit-playsinline', '');
							$('p > img').css('width', '100%');
							if(!dazzleUtil.getRequestValue('ifram')) {
								that.addActionLogByPv(data.data, that.SRC[1], that.PAGE_ID.articleDetails); //添加阅读数量
							}
                            // initImgPreview(); //初始化预览图
                            initImgPreview(docDetailPage); // 初始化预览图
							that.loadRelatedData(data.data.cibiao);
							that.replaceAllVideoToImg();
							detailSetVideoHight(); // 设置视频高度
						});
					}
					that.hideLoadingImg();
				}).catch(function(e) {
					console.log(e);
					that.hideLoadingImg();
				});
			},
			// 分页查询评论
			setPageComment: function() {
				var that = this;
				var url = config.commentUrl + "COMPANYID/APPCODE/USERID/SERVICECODE/v2/comment/queryCommentByJsonEfficient";
				url = dazzleUtil.replaceUrlCommonParam(url);
				var _data = {
					"accessToken": "TOKEN",
					"timeStamp": new Date().getTime(),
					"pageNum": "8",
					"currentPage": that.currentPage,
					"sid": that.docid,
				};
				axios.post(url, _data).then(function(res) {
					var data = that.checkReturn(res);
					if(data !== false) {
						that.currentPage += 1;
						if(that.loadMoreStatus == 2) {
							that.currentList = [];
						}
						$.each(data.data, function(index, item) {
							that.currentList.push(item); //评论列表内容
						})
						that.mescroll.endErr();
						if(data.data.length < 8) {
							that.pageState = false;
						}
					}
				}).catch(function(e) {
					console.log(e);
				});
			},
			setPageComment_bak: function() {
				var that = this;
				// var url = config.commentUrl + "COMPANYID/APPCODE/USERID/SERVICECODE/v2/comment/queryCommentByJsonEfficient";
				// url = dazzleUtil.replaceUrlCommonParam(url);
				var _data = {
					currentPage: that.currentPage,
					conditionParam: {
						sid: that.docid
					}
				};
				this.queryComments4Page(_data, this.COMMENT_SOURCE_TYPE.article, function(data) {
					if (data) {
						that.currentPage += 1;
						if(that.loadMoreStatus == 2) {
							that.currentList = [];
						}
						$.each(data.data.results, function(index, item) {
							that.currentList.push(item); //评论列表内容
						})
						that.mescroll.endErr();
						if(data.data.results.length < 8) {
							that.pageState = false;
						}
					}
				})
				// axios.post(url, _data).then(function(res) {
				// 	var data = that.checkReturn(res);
				// 	if(data !== false) {
				// 		that.currentPage += 1;
				// 		if(that.loadMoreStatus == 2) {
				// 			that.currentList = [];
				// 		}
				// 		$.each(data.data, function(index, item) {
				// 			that.currentList.push(item); //评论列表内容
				// 		})
				// 		that.mescroll.endErr();
				// 		if(data.data.length < 8) {
				// 			that.pageState = false;
				// 		}
				// 	}
				// }).catch(function(e) {
				// 	console.log(e);
				// });
			},
			//统一验证返回状态
			checkReturn: function(res) {
				if(res.status === 200) {
					if(res.data.code === 0 || res.data.code === 2) {
						return res.data;
					}
				}
				return false;
			},
			//设置接口常用参数
			setUrl: function(url) {
				var url = config.apiHost + url + '?companyId=COMPANYID&userId=USERID&appCode=APPCODE&productId=PRODUCTID';
				return dazzleUtil.replaceUrlCommonParam(url);
			},
			//上拉回调 page = {num:1, size:10}; num:当前页 ,默认从1开始; size:每页数据条数,默认10
			upCallback: function(page) {
				this.loadMoreStatus = 1;
				if(this.pageState) {
					this.setPageComment();
				} else {
					this.mescroll.endErr();
				}
			},
			downCallback: function(page) {
				this.loadMoreStatus = 2;
				this.currentPage = 1;
				this.pageState = true;
				this.setPageComment();
			},
			//关闭app下载提示
			closeDowload: function() {
				$("#app_download").remove();
			},
			//加载相关数据
			loadRelatedData: function(cibiao) {
				if(!cibiao || !cibiao[0] || !cibiao[0].cbid) {
					$(".no_related_data").removeClass("hide");
					return;
				}
				if(this.globalConfigData && this.globalConfigData.docDetailPage && this.globalConfigData.docDetailPage.relatedShow == "yes") {
					cibiao = cibiao[0];
					var url = config.apiHost + "api/xy/toc/v1/queryReleaseContent?companyId=COMPANYID&appCode=APPCODE&userId=USERID&productId=PRODUCTID&cbid=CBIDB&currentPage=1&pageNum=PAGENUM";
					url = dazzleUtil.replaceUrlCommonParam(url);
					url = url.replace("CBIDB", cibiao.cbid).replace("PAGENUM", this.globalConfigData.docDetailPage.relatedNum);
					axios.get(url).then(function(res) {
						var data = docDetailPage.checkReturn(res);
						if(data !== false && data.data.results) {
							var results = data.data.results;
							var beCountIds = [];
							$.each(results, function(index, item) {
								if(item.docid != docDetailPage.docid) {
									docDetailPage.relatedData.push(item);
									beCountIds.push(item.docid);
								}
							});
							if(docDetailPage.relatedData.length == 0) {
								$(".no_related_data").removeClass("hide");
							}
						} else {
							$(".no_related_data").removeClass("hide");
						}
					}).catch(function(e) {
						console.error("查询文稿相关数据异常!");
						console.log(e);
						$(".no_related_data").removeClass("hide");
					});
				}
			},
			//因为原生video标签在安卓app中,点击全屏按钮会显示白屏，所以要替换成图片，然后点击播放
			replaceAllVideoToImg: function() {
				var timeId = setInterval(function(){
					if(!$("body").is(":hidden")){
						clearInterval(timeId);
						$("video").each(function(i) {
							var videoObj = $(this);
							var poster = $(this).attr("poster");
                            // var vHeight = videoObj[0].offsetHeight;
                            var vHeight = '3.5rem';  // 赋值
							videoObj.css({
								"display":"none"
							});
							var html = "<div class='video_img_div' style='height:" + vHeight + "'>\
														<img class='video_poster' src='" + poster + "'/>\
														<img class='video_play' src='../../common/img/play_btn.png'>\
													</div>";
							$(this).after(html);
							$(this).next().find(".video_play").click(function() {
								videoObj[0].play();
								videoObj.css({
									"display": ""
								});
								videoObj.addClass("playing");
								$(this).parent().remove();
							});
						});
					}
				},100);
			},
			//app预览图片
			appPreviewImgs: function(index) {
				var imags = [];
				$(".rich_media_content img").not(".video_poster,.video_play").each(function(i, item) {
					var src = $(item).attr("src");
					imags.push(src);
				});
				var json = {
					imags: imags,
					index: index
				};
				if(dazzleUtil.checkOpenDevice() == "ios") {
					try {
						window.webkit.messageHandlers.appPreviewImgs.postMessage(JSON.stringify(json));
					} catch(e) {}
				} else if(dazzleUtil.checkOpenDevice() == "android") {
					try {
						android.appPreviewImgs(JSON.stringify(json));
					} catch(e) {}

				}
			},
			//跳转到媒体号详情信息页面
			toOfficialProfile: function(ofId) {
				if(dazzleUtil.isApp()) {
					var json = {
						ofId: ofId,
						title: this.colorfulInfo.colorfulCloudName || ""
					};
					if(dazzleUtil.checkOpenDevice() == "ios") {
						try {
							window.webkit.messageHandlers.toOfficialProfile.postMessage(JSON.stringify(json));
						} catch(e) {}
					} else if(dazzleUtil.checkOpenDevice() == "android") {
						try {
							android.toOfficialProfile(JSON.stringify(json));
						} catch(e) {}
					}
				} else {
					var url = document.location.protocol + '//' + window.location.host + '/pages/officialProfile/details.html?ofId=' + ofId +
						'&companyId=' + config.companyId +
						'&productId=' + config.productId;
					window.location.href = url;
				}
			},
			getUrlParam:function  (name) {
				var reg = new RegExp('(^|&)' + name + '=(.*)(&[^&=]+=)');
				var regLast = new RegExp('(^|&)' + name + '=(.*)($)');
				var r = window.location.search.substr(1).match(reg) || window.location.search.substr(1).match(regLast);
				if (r != null) {
					var l = r[2].match(/&[^&=]+=/)
					if (l) {
						return decodeURIComponent(r[2].split(l[0])[0]);
					} else return decodeURIComponent(r[2]);
				}
				return null;
			},
			handlePvSum: function () {
				var self = this;
				var companyId = this.getUrlParam('companyId');
				var appCode = this.getUrlParam('appCode');
				var serviceCode = this.getUrlParam('serviceCode');
				var id = this.getUrlParam('id');
				var channelName = this.getUrlParam('ffChannelName');
				var channelId = this.getUrlParam('ffChannelId');

				console.log(companyId,"companyId获取地址栏的参数");
				var url = config.apiHost + "/api/ff/h5/addPageView";
				var paramJson = {
					companyId: companyId,
					appCode: appCode,
					serviceCode: serviceCode,
					id: id,
					channelName: channelName,
					channelId: channelId,
					authorizeId:'',
					authorizeName:''
				};
				// axios.get(url, {
				// 	params: paramJson
				// }).then(function(res) {
				// 	var data = that.checkReturn(res);
				// 	if(data) {
				// 		if(data.data.num < 0) {
				// 			that.cZan = 0;
				// 		} else {
				// 			that.cZan = data.data.num;
				// 		}
				// 	}
				// }).catch(function(e) {
				// 	console.log(e);
				// });
			},
			handleGetPvNum: function () {
				var self = this;
				var id = this.getUrlParam('id');
				var url = config.apiHost + "/api/ff/h5/getPageView?id=" + id;
				// axios.get(url).then(function(res) {
				// 	var data = that.checkReturn(res);
				// 	if(data) {
				// 		if(data.data.num < 0) {
				// 			that.cZan = 0;
				// 		} else {
				// 			that.cZan = data.data.num;
				// 		}
				// 	}
				// }).catch(function(e) {
				// 	console.log(e);
				// });
			}
		},
		mounted: function() {
			this.getGlobalConfig(); //获取全局配置
			this.handlePvSum();//正加阅读量
			window.addEventListener('scroll', this.menu); //监听页面滚动
			var self = this;
			self.mescroll = new MeScroll("mescroll", { //请至少在vue的mounted生命周期初始化mescroll,以确保您配置的id能够被找到
				up: {
					offset: 10,
					callback: self.upCallback, //上拉回调
				},
				down: {
					auto: false, //初始化首页时不触发下拉动作
					isLock: false, //初始化锁定 不让操作下拉
					callback: self.downCallback, //下拉回调
				},
			});
			xyAuth.init({
				domain: config.apiHost
			});
			this.getFP(); //获取计算UV的属性值,将赋给全局变量FP
			this.$nextTick(function() {
				initImgPreview(); // 初始化预览图
			});
			if(dazzleUtil.isApp()) {
				$('html, body').css('height', 'auto');
			}
		}
	})
});
