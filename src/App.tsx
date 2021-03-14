/* eslint-disable react-hooks/exhaustive-deps */
import { LinkOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Input, Menu, Tabs } from 'antd';
import 'antd/dist/antd.css';
import mobile from 'ismobilejs';
import { ajax } from 'jquery';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './App.css';
import { frames, links } from './config.js';
import useQuery from './useQuery';
import useWeather from './useWeather';

// TODO: make blog accessible via scrolling down the bottom of the page
const DEBUG = true;
// Custom constructor hook; run once before render
function useConstructor(callBack = () => {}) {
	const [hasBeenCalled, setHasBeenCalled] = useState(false);
	if (hasBeenCalled) return;
	callBack();
	setHasBeenCalled(true);
}

function App() {
	const [{ q, engine }, updateQuery] = useQuery();
	const [inputKey, setInputKey] = useState(q);
	const [searchKey, setSearchKey] = useState(q);
	const [defaultEngine, setDefaultEngine] = useState(frames('', false)[0].title);
	const [hasProxy, setHasProxy] = useState(false);
	// const [tabActiveKey, setTabActiveKey] = useState(engine);

	// Detect if user has proxy & switch tabs accordingly
	useConstructor(() => {
		ajax({
			type: 'GET',
			url: 'https://ipapi.co/jsonp/',
			async: false,
			dataType: 'jsonp',
			success: function (res) {
				const userHasProxy = res.country === 'CN' ? false : true;
				setHasProxy(userHasProxy);
				const key = userHasProxy
					? frames('', userHasProxy)[0].title
					: frames('', userHasProxy)[1].title;
				setDefaultEngine(key);
			},
		});
	});

	//* Core search functionality
	const history = useHistory();

	const handleSetSearch = (key: string) => {
		if (key === searchKey) {
			return;
		} else {
			setSearchKey(key);
		}
	};
	const debounceSetSearch = useCallback(debounce(handleSetSearch, 1000), [searchKey]);
	const handleSetSearchQuery = (key: string) => {
		if (key === q) {
			return;
		} else {
			updateQuery({ q: key });
		}
	};
	const debounceSetSearchQuery = useCallback(debounce(handleSetSearchQuery, 1000), [engine]);

	// Handle input change
	const handleInputChange = (e: any) => {
		const key = e.target.value;
		if (key === inputKey) {
			return;
		} else {
			debounceSetSearch(key);
			debounceSetSearchQuery(key);
			setInputKey(key);
		}
	};
	// Handle search query change
	useEffect(() => {
		setInputKey(q ?? '');
		handleSetSearch(q);
	}, [q]);

	// When logo or clear button is clicked
	const handleReset = () => {
		setInputKey('');
		handleSetSearch('');
		history.push('/');
	};

	const handleTabClick = (tabKey: React.SetStateAction<string>, e: any) => {
		if (tabKey === engine) {
			history.go(0);
			return;
		}
		updateQuery({ engine: tabKey });
	};

	// Auto focus search bar after refresh
	const indexSearchBarRef = useRef<any>(null);
	const landingSearchBarRef = useRef<any>(null);
	useEffect(() => {
		if (searchKey) {
			landingSearchBarRef?.current?.focus?.();
			document.title = `${searchKey} - ${engine || defaultEngine}`;
		} else {
			indexSearchBarRef?.current?.focus?.();
			document.title = 'Metasearch - 探索未知';
		}
	}, [searchKey, engine]);

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
						<div onClick={handleReset}>
							<img className='logo-left' src='favicon.png' alt='Logo' />
						</div>
						<Input.Search
							className='search-bar-landing'
							placeholder='蓦然回首，那人却在，灯火阑珊处'
							value={inputKey}
							onSearch={handleSetSearch}
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
						<Tabs activeKey={engine ? engine : defaultEngine} onTabClick={handleTabClick}>
							{frames(encodeURIComponent(searchKey), hasProxy)
								// .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0))
								.map(({ title, link }) => (
									<Tabs.TabPane key={title} tab={title} className='tabpane'>
										{DEBUG ? (
											<dl>
												<dt>Search Key</dt>
												<dd>{searchKey}</dd>
												<dt>Engine</dt>
												<dd>{engine}</dd>
											</dl>
										) : (
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
										)}
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
							onSearch={handleSetSearch}
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
