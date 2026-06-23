const students=[
    {id: 1, name:'Aman', marks:85, attendance:92},
    {id:2, name:'Riya', marks:38, attendance:76},
    {id:3, name:'Karan', marks:67, attendance:81},
    {id:4, name:'Simran', marks:91, attendance:88}, 
    {id:5, name:'Raj', marks:45, attendance:60}, 
    {id:6, name:'Neha', marks:29, attendance:95}
]
const passedStudents=students.filter(student=>student.marks>=40);

//console.log('List of Passed Students:', passedStudents);

for(let i=0; i<passedStudents.length; i++){
    console.log(`${passedStudents[i].name} has got ${passedStudents[i].marks} with attendance ${passedStudents[i].attendance}`);
}