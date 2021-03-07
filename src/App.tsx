import { Button, Input, Tabs } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import request from 'umi-request';
import './App.css';
import { frames, links } from './config.js';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

function App() {
	// Active key of tabs
	const [activeKey, setActiveKey] = useState(frames('', false)[0].title);
	const handleTabClick = (key: React.SetStateAction<string>, e: any) => {
		setActiveKey(key);
	};
	const indexSearchBarRef = useRef<any>(null);
	const landingSearchBarRef = useRef<any>(null);
	// Detect if user has proxy
	const [hasProxy, setHasProxy] = useState(false);
	useEffect(() => {
		(async () => {
			const req = await request.get('http://ip-api.com/json/');
			const userHasProxy = req.countryCode === 'CN' ? false : true;
			setHasProxy(userHasProxy);
			setActiveKey(
				userHasProxy ? frames('', userHasProxy)[0].title : frames('', userHasProxy)[1].title
			);
		})();
		indexSearchBarRef?.current?.focus?.();
		landingSearchBarRef?.current?.focus?.();
	}, []);

	// Query string functionality
	const history = useHistory();
	const [keyword, setKeyword] = useState(useQuery()?.get('q') ?? '');
	const handleChange = (e: any) => {
		setKeyword(e.target.value);
		history.push(`/?q=${e.target.value}`);
		indexSearchBarRef?.current?.focus?.();
	};

	const handleReset = () => {
		setKeyword('');
		history.push(`/`);
		indexSearchBarRef?.current?.focus?.();
	};
	return (
		<>
			{keyword ? (
				<div className='app-container'>
					<div className='head-container'>
						<img className='logo-left' src='favicon.png' alt='' onClick={handleReset} />
						<Input.Search
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							value={keyword}
							onSearch={setKeyword}
							onChange={handleChange}
							size='large'
							allowClear
							ref={landingSearchBarRef}
						/>
					</div>
					<div className='body-container'>
						<Tabs
							activeKey={activeKey}
							defaultActiveKey={frames('', hasProxy)[0].title}
							onTabClick={handleTabClick}
							tabBarExtraContent={links(encodeURIComponent(keyword)).map(({ link, title }) => (
								<Button key={title}>
									<a
										title={title}
										key={link}
										href={link}
										target='_blank'
										rel='noreferrer'
										className='links'
									>
										{title}
									</a>
								</Button>
							))}
						>
							{frames(encodeURIComponent(keyword), hasProxy)
								.sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
								.map(({ title, link }) => (
									<Tabs.TabPane key={title} tab={title} className='tabpane'>
										<iframe
											title={title}
											className='frame'
											src={link}
											width='100%'
											height='100%'
											frameBorder='0'
											loading='eager'
											referrerPolicy='no-referrer'
										/>
									</Tabs.TabPane>
								))}
						</Tabs>
					</div>
				</div>
			) : (
				<div
					className='index-page'
					style={{
						backgroundImage:
							'url(https://cdnb.artstation.com/p/assets/images/images/009/312/021/large/alena-aenami-aenami-lunar.jpg?1518269866)',
					}}
				>
					<div className='index-head'>
						{/* <img className='logo-center' src='favicon.png' alt='' /> */}
						<span className='index-title'>🚀 Meta Search</span>
					</div>
					<div className='search-bar'>
						<Input.Search
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							// value={keyword}
							onSearch={setKeyword}
							// onChange={handleChange}
							size='large'
							allowClear
							ref={indexSearchBarRef}
						/>
					</div>
				</div>
			)}
		</>
	);
}

export default App;
