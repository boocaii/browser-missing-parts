import React, { useState, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import hotkeys from 'hotkeys-js';
import './style.css';

const search_bar_id = 'browser-missing-parts-search-bar';
const input_id = 'browser-missing-parts-input';
const minWidth = 500; // px
const maxWidth = 1000; // px


hotkeys('ctrl+l', function (event, handler) {
	event.preventDefault()
	show_search_bar();
});
hotkeys('ctrl+shift+l', function (event, handler) {
	event.preventDefault()
	hide_search_bar();
});

window.addEventListener('resize', (e) => {
	const root = get_root();
	if (root) {
		root.style.width = cal_width() + 'px';
		root.style.left = ((window.innerWidth - cal_width()) / 2) + 'px'
	}
	// const input = get_input();
	// if (input) {
	// 	input.style.width = (cal_width() - 16) + 'px';
	// }
})


function SearchBar(props: any) {
	const inputRef = useRef<HTMLInputElement>(null);
	const ulRef = useRef<HTMLUListElement>(null);
	const [results, setResults] = useState<any[]>([]);
	const [selected, setSelected] = useState(0);

	const handleChange = (e: any) => {
		const val = e.target.value;
		if (!val) {
			setResults([]);
			return
		}
		chrome.runtime.sendMessage(
			{ query: val },
			(resp) => {
				console.log('resp:', resp)
				setResults(resp.results)
			}
		)
	}

	const handleScroll = (e: any) => {
		const top = e.target.scrollTop;
		if (inputRef.current) {
			if (top != 0) {
				inputRef.current.style.borderBottom = '0.5px solid rgba(0,0,0,0.4)';
			} else {
				inputRef.current.style.borderBottom = 'none';
			}
		}
	}

	const handleKeyDown = (e: any) => {
		const t = selected;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (t + 1 < results.length) {
				setSelected(t + 1)
			}
			if (t + 1 >= 15 && ulRef.current) {
				ulRef.current.scrollBy(0, 36.5)
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (t - 1 >= 0) {
				setSelected(t - 1)
			}
			if (t - 1 <= results.length - 15 && ulRef.current) {
				ulRef.current.scrollBy(0, -36.5)
			}
		} else if (e.key === 'Enter') {
			window.open(results[selected].url)
		}
	}

	const handleEnter = (e: any) => {
	}

	useEffect(() => {
		setSelected(0);
	}, [results])

	let list: any;
	if (results && results.length > 0) {
		list =
			<ul
				ref={ulRef}
				onScroll={handleScroll}
				style={{
					maxHeight: 36.5 * 15 + 'px',
				}}
				onKeyDown={handleKeyDown}
			>
				{results.map((t: any) =>
					<a
						href={t.url}
						target='_blank'
						key={t.key}
						className={selected == t.key ? 'browser-missing-parts-selected' : ''}
						onKeyDown={handleEnter}
					>
						<li>
							<span className='browser-missing-parts-title'>
								{t.title}
							</span>
							<span>{new URL(t.url).host}</span>
						</li>
					</a>
				)}
			</ul>
	}

	return (
		<>
			<input
				ref={inputRef}
				id={input_id}
				type="text"
				style={{
					width: (cal_width() - 16) + 'px',
				}}
				autoFocus={true}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			></input>
			{list}
		</>
	)
}


function cal_width() {
	let w = window.innerWidth;
	return Math.min(Math.max(w * 0.6, minWidth), maxWidth)
}

function init_search_bar() {
	console.log('init search bar')

	let p = document.createElement('div')
	p.id = search_bar_id
	p.style.width = cal_width() + 'px'
	p.style.left = ((window.innerWidth - cal_width()) / 2) + 'px'

	document.body.appendChild(p);

	const root = ReactDOM.createRoot(p);
	root.render(<SearchBar />);

	p.addEventListener('keyup', function (e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			hide_search_bar()
		}
	})

	p.addEventListener('focusout', function (e) {
		hide_search_bar()
	})
}


function get_root() {
	return document.getElementById(search_bar_id)
}

function get_input(): any {
	return document.getElementById(input_id)
}

function show_search_bar() {
	const t = get_root()
	if (t) {
		t.style.display = ''
	} else {
		init_search_bar()
	}
	focus_input()
}

function hide_search_bar() {
	const t = get_root()
	if (t) { t.style.display = 'none' }
}

function focus_input() {
	const input = get_input();
	if (input) {
		input.focus()
		input.setSelectionRange(input.value.length, input.value.length)
	}
}

