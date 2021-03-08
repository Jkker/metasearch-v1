/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Input, Tabs } from 'antd';
import 'antd/dist/antd.css';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import request from 'umi-request';
import './App.css';
import { frames, links } from './config.js';

function useQuery(query: string) {
	return new URLSearchParams(useLocation().search)?.get(query) ?? '';
}

function App() {
	const [inputKey, setInputKey] = useState(useQuery('q'));
	const [searchKey, setSearchKey] = useState(useQuery('q'));

	// Active key of tabs
	const [activeKey, setActiveKey] = useState(useQuery('engine') ?? '');
	const [defaultActiveKey, setDefaultActiveKey] = useState(frames('', false)[0].title);
	const handleTabClick = (key: React.SetStateAction<string>, e: any) => {
		setActiveKey(key);
	};
	useEffect(() => {
		history.push(
			`/?${activeKey ? `engine=${activeKey}&` : ''}${searchKey ? `q=${searchKey}` : ''}`
		);
	}, [activeKey]);

	// Detect if user has proxy
	const [hasProxy, setHasProxy] = useState(false);
	useEffect(() => {
		(async () => {
			const req = await request.get('http://ip-api.com/json/');
			const userHasProxy = req.countryCode === 'CN' ? false : true;
			setHasProxy(userHasProxy);
			const key = userHasProxy
				? frames('', userHasProxy)[0].title
				: frames('', userHasProxy)[1].title;
			setDefaultActiveKey(key);
		})();
	}, []);

	//* Core search functionality
	const history = useHistory();
	const handleSearch = (key: string) => {
		setSearchKey(key);
		history.push(`/?${activeKey ? `engine=${activeKey}&` : ''}${key ? `q=${key}` : ''}`);
	};
	const debounceSearch = useCallback(debounce(handleSearch, 500), []);
	const handleInputChange = (e: any) => {
		debounceSearch(e.target.value);
		setInputKey(e.target.value);
	};
	const handleReset = () => {
		debounceSearch('');
		setInputKey('');
		setActiveKey('');
	};

	// Auto focus search bar after refresh
	const indexSearchBarRef = useRef<any>(null);
	const landingSearchBarRef = useRef<any>(null);
	useEffect(() => {
		if (searchKey) {
			landingSearchBarRef?.current?.focus?.();
			document.title = `MetaSearch - ${searchKey}`;
		} else {
			indexSearchBarRef?.current?.focus?.();
			document.title = 'MetaSearch - 探索未知';
		}
	}, [searchKey]);

	return (
		<>
			{searchKey ? (
				<div className='app-container'>
					<div className='head-container'>
						<img className='logo-left' src='favicon.png' alt='' onClick={handleReset} />
						<Input.Search
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							value={inputKey}
							onSearch={handleSearch}
							onChange={handleInputChange}
							size='large'
							allowClear
							ref={landingSearchBarRef}
						/>
					</div>
					<div className='body-container'>
						<Tabs
							activeKey={activeKey ? activeKey : defaultActiveKey}
							onTabClick={handleTabClick}
							tabBarExtraContent={links(encodeURIComponent(searchKey)).map(({ link, title }) => (
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
							{frames(encodeURIComponent(searchKey), hasProxy)
								// .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
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
					<div className='index-head' onClick={handleReset}>
						{/* <img className='logo-center' src='favicon.png' alt='' /> */}
						<span className='index-title'>🚀 Meta Search</span>
					</div>
					<div className='search-bar'>
						<Input.Search
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							value={inputKey}
							onSearch={handleSearch}
							onChange={handleInputChange}
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
