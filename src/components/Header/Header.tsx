import React from 'react';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className='header'>
            <h1>数字</h1>
            <sub>su-ji</sub>
            <p>An exploration of a combinatorial, <br/> symmetrically elegant puzzle. </p>
            <sub>All solvers run at 100ms/step.</sub>
            <sub>Sudoku encoding must be 81 digits.</sub>
        </header>
    );
};

export default Header;
