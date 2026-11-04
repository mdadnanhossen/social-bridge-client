import React from 'react';

const layout = ({children} : {children : React.ReactNode}) => {
    return (
        <div className='flex gap-6'>
            <div className='font-bold text-6xl'>sidbar</div>
            <div>{children}</div>
            
        </div>
    );
};

export default layout;