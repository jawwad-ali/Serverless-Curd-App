import React from "react"
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./style.css"
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import EditIcon from '@material-ui/icons/Edit';

const APOLLO_QUERY = gql`
{
  todo{
    id
    title
    desc
  }
}`

const ADD_TODO_MUTATION = gql`
  mutation addTodo($title:String! , $desc:String!){
    addTodo( title:$title , desc:$desc){
      title
      desc
    }
  }
`

const DELETE_TODO = gql`
  mutation deleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      title
      desc
    }
  }`

export default function Home() {

  const { loading, error, data } = useQuery(APOLLO_QUERY)
  console.log(data)

  let titleField
  let descField

  const [addTodo] = useMutation(ADD_TODO_MUTATION)
  const [deleteTodo] = useMutation(DELETE_TODO)

  const AddTodoSubmit = () => {
    addTodo({
      variables: {
        title: titleField.value,
        desc: descField.value
      },
      refetchQueries: [{ query: APOLLO_QUERY }]
    })

    console.log(titleField.value, descField.value)
    titleField.value = ""
    descField.value = ""
  }


  // delete
  const handleDelete = (id) => {
    deleteTodo({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: APOLLO_QUERY }]
    })
  }

  if (loading)
    return <h4>Loading....</h4>
  if (error)
    return <h4>Error</h4>


  return (
    <div>
      <div className="container-fluid">
        <div className="text-center bg-primary py-2 text-white heading-div">
          <h1 className="text-uppercase">Serverless Crud App</h1>
        </div>
        <div className="row ">
          <div className="col-lg-6 mt-3 offset-lg-3">
            <div className="">
              <input type="text" className="form-control mb-2" ref={node => titleField = node} placeholder="Title" />
              <input type="text" className="form-control mb-2" ref={node => descField = node} placeholder="Do's" />

              <button className="btn btn-primary" onClick={AddTodoSubmit}>Add Todo</button>
            </div>
          </div>
        </div>
      </div>


      <div className="container mt-5">
        <div className="row">
          {
            data.todo.map((mark) => {
              return (
                <div className="col-lg-12 mt-1 data-container" key={mark.id}>
                  <div className="inner-divs d-flex">
                    <div className="data-left-div">
                      <h5 className="text-uppercase">{mark.title}</h5>
                      <p>{mark.desc}</p>
                    </div>
                    <div className="data-lef-div">
                      <HighlightOffIcon className="icon cross-icon" onClick={() => handleDelete(mark.id)}
                      />
                    </div>
                  </div>
                  <hr />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
} 
