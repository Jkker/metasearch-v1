import { Button, Input, Tabs } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import './App.css';
import { frames, links } from './config.js';

const { TabPane } = Tabs;
const { Search } = Input;

function App() {
	// Get user ip & location
	useEffect(() => {}, []);

	const [query, setQuery] = useState('');
	const handleChange = (e: any) => {
		// console.log(e.target.value);
		setQuery(e.target.value);
		console.log(query);
	};
	return (
		<div className='app-container'>
			<div className='head-container'>
				<Search
					placeholder='那人却在，灯火阑珊处'
					onSearch={setQuery}
					onChange={handleChange}
					size='large'
					allowClear
				/>
			</div>
			<div className='body-container'>
				<Tabs
					tabBarExtraContent={links(encodeURIComponent(query)).map(({ link, title }) => (
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
					{frames(encodeURIComponent(query)).map(({ title, link }) => (
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
