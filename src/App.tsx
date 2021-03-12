/* eslint-disable react-hooks/exhaustive-deps */
import { LinkOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Input, Menu, Tabs } from 'antd';
import 'antd/dist/antd.css';
import mobile from 'ismobilejs';
import { ajax } from 'jquery';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import './App.css';
import { frames, links } from './config.js';
import useWeather from './useWeather';

// TODO: make blog accessible via scrolling down the bottom of the page

// Custom hook to use query string of url
function useQuery(query: string) {
	const queryString = require('query-string');
	return queryString.parse(useLocation().search)?.[query] ?? '';
}
// Custom constructor hook; run once before render
function useConstructor(callBack = () => {}) {
	const [hasBeenCalled, setHasBeenCalled] = useState(false);
	if (hasBeenCalled) return;
	callBack();
	setHasBeenCalled(true);
}

function App() {
	const q = useQuery('q');
	const engine = useQuery('engine');
	const [inputKey, setInputKey] = useState(q);
	const [searchKey, setSearchKey] = useState(q);
	const [activeEngine, setActiveEngine] = useState(engine);
	const [defaultActiveEngine, setDefaultActiveEngine] = useState(frames('', false)[0].title);
	const [hasProxy, setHasProxy] = useState(false);

	// Detect if user has proxy & switch tabs accordingly
	useConstructor(() => {
		ajax({
			type: 'GET',
			url: 'https://ipapi.co/jsonp/',
			async: false,
			dataType: 'jsonp',
			success: function (res) {
				// console.log(res.country);
				const userHasProxy = res.country === 'CN' ? false : true;
				setHasProxy(userHasProxy);
				const key = userHasProxy
					? frames('', userHasProxy)[0].title
					: frames('', userHasProxy)[1].title;
				setDefaultActiveEngine(key);
			},
		});
	});

	//* Core search functionality
	const history = useHistory();
	const handleSearch = (key: string) => {
		if (key === searchKey) {
			// console.log('search key unchanged; refresh');
			history.go(0);
			return;
		} else {
			history.push(`/?${activeEngine ? `engine=${activeEngine}&` : ''}${key ? `q=${key}` : ''}`);
			setSearchKey(key);
			// console.log('handleSearch: ', activeEngine, key);
			// console.log(history);
		}
	};
	const debounceSearch = useCallback(debounce(handleSearch, 500), [handleSearch]);
	const handleInputChange = (e: any) => {
		// console.log('input changed');
		debounceSearch(e.target.value);
		setInputKey(e.target.value);
	};
	const handleReset = () => {
		setActiveEngine('');
		setInputKey('');
		setSearchKey('');
		history.push('/');
	};
	const handleTabClick = (tabKey: React.SetStateAction<string>, e: any) => {
		// setActiveEngine(key);
		if (tabKey === activeEngine) {
			// console.log('tab key unchanged; refresh');
			history.go(0);
			return;
		}
		setActiveEngine(tabKey);
		history.push(`/?${tabKey ? `engine=${tabKey}&` : ''}${searchKey ? `q=${searchKey}` : ''}`);
		// console.log('Tab change: ', activeEngine, searchKey);
	};

	useEffect(() => {
		setSearchKey(q);
		setInputKey(q);
		setActiveEngine(engine);
	}, [q, engine]);

	// Auto focus search bar after refresh
	const indexSearchBarRef = useRef<any>(null);
	const landingSearchBarRef = useRef<any>(null);
	useEffect(() => {
		if (searchKey) {
			landingSearchBarRef?.current?.focus?.();
			document.title = `${searchKey} - ${activeEngine || defaultActiveEngine}`;
		} else {
			indexSearchBarRef?.current?.focus?.();
			document.title = 'Metasearch - 探索未知';
		}
	}, [searchKey, activeEngine]);

	// Detect if user is on mobile platform & parse link accordingly
	const isMobile = mobile().any;
	const platform = isMobile ? 'mobile' : 'desktop';
	const parseLink = (link: any) => {
		return link?.[platform] ?? link;
	};

	const menu = isMobile ? (
		<Menu>
			{links(encodeURIComponent(searchKey)).map(({ link, title }) => (
				<Menu.Item key={title}>
					<a
						title={title}
						key={title}
						href={link}
						target='_blank'
						rel='noreferrer'
						className='links'
					>
						{title}
					</a>
				</Menu.Item>
			))}
		</Menu>
	) : (
		<div className='links-container'>
			{links(encodeURIComponent(searchKey)).map(({ link, title }) => (
				<Button key={title} className='dropdown-button'>
					<a
						title={title}
						key={title}
						href={link}
						target='_blank'
						rel='noreferrer'
						className='links'
					>
						{title} <LinkOutlined />
					</a>
				</Button>
			))}
		</div>
	);

	useWeather('#weather');

	return (
		<>
			<div id='weather' style={{ display: searchKey ? 'none' : 'block' }}></div>
			{searchKey ? (
				<div className='app-container'>
					<div className='head-container'>
						<Link to='/'>
							<img className='logo-left' src='favicon.png' alt='Logo' />
						</Link>
						<Input.Search
							className='search-bar-landing'
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							value={inputKey}
							onSearch={handleSearch}
							onChange={handleInputChange}
							size='large'
							allowClear
							ref={landingSearchBarRef}
						/>
						<div className='links-container'>
							<Divider type='vertical' />
							{isMobile ? (
								<Dropdown overlay={menu}>
									<Button className='dropdown-button' type='primary' ghost>
										Links <LinkOutlined />
									</Button>
								</Dropdown>
							) : (
								menu
							)}
						</div>
					</div>
					<div className='body-container'>
						<Tabs
							activeKey={activeEngine ? activeEngine : defaultActiveEngine}
							onTabClick={handleTabClick}
						>
							{frames(encodeURIComponent(searchKey), hasProxy)
								// .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
								.map(({ title, link }) => (
									<Tabs.TabPane key={title} tab={title} className='tabpane'>
										<iframe
											title={title}
											className='frame'
											src={parseLink(link)}
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
				<div className='index-page'>
					<div className='index-head' onClick={handleReset}>
						<img className='logo-center' src='logo.png' alt='' />
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
