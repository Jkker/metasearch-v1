import { Button, Input, Tabs } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './App.css';
import { frames, links } from './config.js';

const { TabPane } = Tabs;
const { Search } = Input;

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

function App() {
	// Get user ip & location
	useEffect(() => {}, []);
	const history = useHistory();
	const [keyword, setKeyword] = useState(useQuery()?.get('q') ?? '');
	const handleChange = (e: any) => {
		setKeyword(e.target.value);
		history.push(`/?q=${e.target.value}`);
	};
	return (
		<div className='app-container'>
			<div className='head-container'>
				<Search
					placeholder='蓦然回首，那人却在，灯火阑珊处'
					value={keyword}
					onSearch={setKeyword}
					onChange={handleChange}
					size='large'
					allowClear
				/>
			</div>
			<div className='body-container'>
				<Tabs
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
					{frames(encodeURIComponent(keyword)).map(({ title, link }) => (
						<TabPane key={link} tab={title} className='tabpane'>
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
						</TabPane>
					))}
				</Tabs>
			</div>
		</div>
	);
}

export default App;
