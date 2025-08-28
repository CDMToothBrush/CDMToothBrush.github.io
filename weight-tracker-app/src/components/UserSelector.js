import React from 'react';

const UserSelector = ({ selectedUser, setSelectedUser }) => {
    const users = ['Benson', 'Marvis'];

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    };

    return (
        <div className="user-selector">
            <label htmlFor="user-select">選擇用戶:</label>
            <select id="user-select" value={selectedUser} onChange={handleUserChange}>
                {users.map((user) => (
                    <option key={user} value={user}>
                        {user}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default UserSelector;