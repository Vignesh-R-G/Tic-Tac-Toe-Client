import React, { useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import { useState ,useContext} from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import '../css/game.css'
import { socket } from './Socket'

export const Game=()=>{

    // Room Details
    const [name,setName]=useState("")
    const [roomid,setRoomId]=useState("")
    const [roomflag,setRoomFlag]=useState(false)
    const [createroomflag,setCreateRoomFlag]=useState(false)
    const [randomflag,setRandomFlag]=useState(false)
    const [gamestartflag,setGameStartFlag]=useState(false)

    // Chat Details
    const [message,setMessage]=useState('')
    const [allmessages,setAllMessages]=useState([])

    // Game Details
    const [clickedState,setClickedState]=useState(false)

    const [gameflag,setGameFlag]=useState(false)

    // To set the player whether X or O
    const [player,setPlayer]=useState('')

    const [board,setBoard]=useState([
        ['','',''],
        ['','',''],
        ['','','']
    ])

    const [clickedarray,setClickedArray]=useState([])

    const [winner,setWinner]=useState("")
    

    // to receive the game information on a paricular room
    useEffect(()=>{

        const handleUpdatedBoard = (data) => {
            console.log(data)
            setBoard(data.board)
            setClickedArray(data.clickedarray)
            setClickedState(data.clickedState)
            setWinner(data.winner)
        };
    
        const handleReceiveMessage = (data) => {
            setAllMessages((prevMessages) => [...prevMessages, data])
        }

        const handlePlayerDetails=(playerdata)=>{
            setPlayer(playerdata)
        }

        const alertForRoomFull=(data)=>{
            alert(data)
            setGameFlag(false)
        }

        const isRoomExist=(data)=>{
            alert('Room Does Not Exist')
            setGameFlag(false)
        }

        const handleRandomRoom=(data)=>{
            setRoomId(data.roomid)
            setPlayer(data.playerinfo)
        }

        const handleStartGame=(data)=>{
            setGameStartFlag(data)
        }
    
        socket.on('updatedboard', handleUpdatedBoard)
        socket.on('receivemessage', handleReceiveMessage)
        socket.on('playerdetails',handlePlayerDetails)
        socket.on('alertforroomfull',alertForRoomFull)
        socket.on('isroomexist',isRoomExist)
        socket.on('randomroomdetails',handleRandomRoom)
        socket.on('cangamestart',handleStartGame)
    
        return () => {
            socket.off('updatedboard', handleUpdatedBoard)
            socket.off('receivemessage', handleReceiveMessage)
            socket.off('playerdetails',handlePlayerDetails)
            socket.off('alertforroomfull',alertForRoomFull)
            socket.off('isroomexist',isRoomExist)
            socket.off('randomroomdetails',handleRandomRoom)
            socket.off('cangamestart',handleStartGame)
        }

    },[])

    // to update the game to room
    const updateToRoom=(xindex,yindex,index,winstate)=>{
        console.log(winstate)
        var boardmatrix=[]
        if(!clickedState){
            boardmatrix=[...board]
            boardmatrix[xindex][yindex]='X'
        }
        else{
            boardmatrix=[...board]
            boardmatrix[xindex][yindex]='O'
        }
        const array=[...clickedarray,index]
        const state=!(clickedState)
        const data={
            board:boardmatrix,
            clickedarray:array,
            clickedState:state,
            winner:winstate,
            roomid:roomid
        }
        socket.emit('updateboard',data)
    }

   
    // to check the match condition
    const checkMatchCondition=(xindex,yindex,index)=>{

        var boardmatrix=[]
        if(!clickedState){
            boardmatrix=[...board]
            boardmatrix[xindex][yindex]='X'
        }
        else{
            boardmatrix=[...board]
            boardmatrix[xindex][yindex]='O'
        }
        
        //row wise checking
        if(boardmatrix[0][0] && (boardmatrix[0][0]===boardmatrix[0][1]) && (boardmatrix[0][1]===boardmatrix[0][2])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][0]+" is the winner")

        }
        else if(boardmatrix[1][0] && (boardmatrix[1][0]===boardmatrix[1][1]) && (boardmatrix[1][1]===boardmatrix[1][2])){
            updateToRoom(xindex,yindex,index,boardmatrix[1][0]+" is the winner")
        }
        else if(boardmatrix[2][0] && (boardmatrix[2][0]===boardmatrix[2][1]) && (boardmatrix[2][1]===boardmatrix[2][2])){
            updateToRoom(xindex,yindex,index,boardmatrix[2][0]+" is the winner")
        }

        //column wise checking
        else if(boardmatrix[0][0] &&(boardmatrix[0][0]===boardmatrix[1][0]) && (boardmatrix[1][0]===boardmatrix[2][0])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][0]+" is the winner")
        }
        else if(boardmatrix[0][1] &&(boardmatrix[0][1]===boardmatrix[1][1]) && (boardmatrix[1][1]===boardmatrix[2][1])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][1]+" is the winner")
        }
        else if(boardmatrix[0][2] &&(boardmatrix[0][2]===boardmatrix[1][2]) && (boardmatrix[1][2]===boardmatrix[2][2])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][2]+" is the winner")
        }

        //diagonal wise checking
        else if(boardmatrix[0][0] &&(boardmatrix[0][0]===boardmatrix[1][1]) && (boardmatrix[1][1]===boardmatrix[2][2])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][0]+" is the winner")
        }
        else if(boardmatrix[0][2] &&(boardmatrix[0][2]===boardmatrix[1][1]) && (boardmatrix[1][1]===boardmatrix[2][0])){
            updateToRoom(xindex,yindex,index,boardmatrix[0][2]+" is the winner")
        }

        //check draw condition
        else if(clickedarray.length==8){
            updateToRoom(xindex,yindex,index,'Match Has Been Draw')
        }
        else{
            updateToRoom(xindex,yindex,index,'')
        }
    }

    // to change the state of the box (X or O)
    const changeState=(xindex,yindex)=>{

        var index=xindex+""+yindex

        // the box which is already clicked should not be clicked
        if(!clickedarray.includes(index) && !winner){
            checkMatchCondition(xindex,yindex,index)
        }

    }

    // to join in the room
    const joinRoom=()=>{
        if(roomid && name){
            const data={
                roomid:roomid,
                name:name
            }
            socket.emit('joinroom',data)
            setGameFlag(true)
        }
    }

    // to send the message in the room
    const sendMessage=()=>{
        const data={
            name:name,
            message:message,
            date:new Date(Date.now()).getHours()+':'+new Date(Date.now()).getMinutes(),
            roomid:roomid
        }
        socket.emit('sendmessage',data) 
    }

    // To create a Room
    const createRoom=()=>{
        setRoomFlag(false)
        setRandomFlag(false)
        setCreateRoomFlag(true)
        const min = 100000
        const max = 999999
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
        setRoomId(randomNumber.toString())
        const data={
            roomid:randomNumber.toString()
        }
        socket.emit('createroom',data)
    }

    // To join a random room
    const randomRoom=()=>{
       const data={
        name:name
       } 
       setGameFlag(true)
       socket.emit('randomroom',data)
    }   

    console.log(player)
    console.log(roomid)
    return(
        <div className='container-fluid'>
            <br></br>
            <h1 style={{textAlign:"center"}}>Tic Tac Toe</h1>
            <br></br>
            <br></br>
            {!gameflag?<div>
            <center>
                <button className='btn btn-secondary' onClick={()=>createRoom()}>Create a Room</button>
                <button className='btn btn-success' style={{margin:"5px"}} onClick={()=>{setRoomFlag(true);setCreateRoomFlag(false);setRandomFlag(false)}}>Join with Room Id</button>
                <button className='btn btn-secondary' style={{margin:"5px"}} onClick={()=>{setRoomFlag(false);setCreateRoomFlag(false);setRandomFlag(true)}}>Join with Random Player</button>
            </center>
            <br></br>
            <br></br>
            <div className='row'>
                <div className='col-md-4'></div>
                <div className='col-md-4'>
                    {roomflag?
                    <form>
                        <input type="text" onChange={(e)=>setName(e.target.value)} className='form-control' placeholder="Enter Your Name"></input>
                        <br></br>
                        <input type="text" onChange={(e)=>setRoomId(e.target.value)} className='form-control' placeholder="Enter Room Id to join the Room"></input>
                        <br></br>
                        <center>
                            <button className='btn btn-secondary' onClick={()=>joinRoom()}>Join Room</button>
                        </center>
                    </form>:""}
                    {
                        createroomflag?
                        <form>
                            <h3 style={{textAlign:"center"}}>Room ID : {roomid}</h3>
                            <br></br>
                            <input type="text" onChange={(e)=>setName(e.target.value)} className='form-control' placeholder="Enter Your Name"></input>
                            <br></br>
                            <center>
                                <button className='btn btn-secondary' onClick={()=>joinRoom()}>Join Room</button>
                            </center>
                        </form>:""
                    }
                    {
                        randomflag?
                        <form>
                            <br></br>
                            <input type="text" onChange={(e)=>setName(e.target.value)} className='form-control' placeholder="Enter Your Name"></input>
                            <br></br>
                            <center>
                                <button className='btn btn-secondary' onClick={()=>randomRoom()}>Join Room</button>
                            </center>
                        </form>:""
                    }
                </div>
                <div className='col-md-4'></div>
            </div>
            </div>:<div>
            {(!gamestartflag)?<h3 className='waitingstyle'>Waiting for the Opponent !</h3>:<div>
            <br></br>
            {(winner==="")?<h3 style={{textAlign:"center"}}>{((clickedState && player==='O') || (!
                clickedState && player==='X'))?"Your":"Opponent"} Turn Now</h3>:<h3 style={{textAlign:"center"}}>{winner}</h3>}
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <div className='row'>
                <div className='col-md-1'></div>
                <div className='col-md-4'>
                    <table>
                        <tbody>
                            {board.map((x,xindex)=>
                                <tr>
                                    {board[xindex].map((y,yindex)=>
                                        (clickedState && player==='O') || (!clickedState && player==='X')?
                                        <td onClick={()=>changeState(xindex,yindex)}>{board[xindex][yindex]}</td>
                                        :
                                        <td>{board[xindex][yindex]}</td>
                                    )}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='col-md-1'></div>
                <div className='col-md-4'>
                    <div className='chat-container'>
                    {allmessages.map((x)=>
                        <div className='chat-message'> 
                            {x.name===name?
                            <div className='float-end' style={{textAlign: "right"}}>
                                <h3>{x.name}</h3>
                                <p>{x.date}</p>
                                <p>{x.message}</p>
                                <br></br>
                            </div>:
                            <div className='float-start' >
                                <h3>{x.name}</h3>
                                <p>{x.date}</p>
                                <p>{x.message}</p>
                                <br></br>
                            </div>}
                        </div>
                    )}
                    </div>
                    <div className='chat-input'>
                    <input type="text"  className='form-control' placeholder="Type Something....." onChange={(e)=>setMessage(e.target.value)}></input>
                    <button className='btn btn-success' onClick={()=>sendMessage()}>&#9658;</button>
                    </div>
                </div>
            </div>
            </div>}
        </div>}
        </div>  
    )
}