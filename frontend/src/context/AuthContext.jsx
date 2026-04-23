import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(
    JSON.parse(localStorage.getItem('student')) || null
  );

  const login = (token, studentData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('student', JSON.stringify(studentData));
    setStudent(studentData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);