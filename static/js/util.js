/* Utility functions */

const clone_template = (id) => $(document.getElementById(id).content.cloneNode(true))


// Split name into 2 lines and adjust fontsize
function parse_name(name){
  name = name.toUpperCase()
  name = name.slice(0, 8)
  let mid = Math.floor(name.length/2)


  if (mid == 1){
    name = [name.split('')]
  }

  if (name.length > 3){
    name = [
      name.slice(0, mid).split(''), 
      name.slice(mid, name.length).split('')
    ]
  }

  const scale_map = {2: 2.8, 3: 2.3, 4: 1.8}
  let scale = scale_map[name[name.length-1].length];

  let t = $('<div></div>')
  for (let row=0; row<name.length; row++){
    let rowdiv = $('<div class="row"></div>')
    for (let col=0; col<name[row].length; col++){
      let el = $(`<div class="col">${name[row][col]}</div>`)
      el.css({'transform': `scale(${scale}, ${scale}`})
      rowdiv.append(el)
    }
    if (name.length==1)
      rowdiv.toggleClass('vertical-center')
    t.append(rowdiv)
  }

  return t.html()
}


// ------------------------------------------------------------------ //
// Lambda calls to update state
// ------------------------------------------------------------------ //

const default_onsuccess = function(data){
  // console.log("result: " + data);
}

function lambda_call(cmd, app_args, async=false, onsuccess=default_onsuccess){

  $.ajax({                   
    data: {
      'command': `app:${cmd}`,
      'app_args': JSON.stringify(app_args),
    },
    async: async,
    type: 'POST',
    url: 'https://n3fe5ycrn9.execute-api.us-east-1.amazonaws.com/default/slack_chores',
    success: onsuccess,
    traditional: true
  })
}

function lambda_update_order(order=null){

  // read order from page
  if (order == null){
    order = $('#chore-list').sortable('serialize');
    order = order.replaceAll('cell[]=', ' ')
    order = order.replaceAll('&', '')
    order = order.trim().split(' ')
  }

  if (state.order.toString() != order.toString()){
    state.order = order
    lambda_call('update_order', {'order': order})
  }
  
}

function lambda_delete_chore(name, replace=null){
  delete state.chores[name]

  let order = [...state.order]
  if (replace != null)
    order[order.indexOf(name)] = replace
  else
    order.splice(order.indexOf(name), 1)
  
  lambda_update_order(order)
  lambda_call('delete_chore', {'name': name})
}

function lambda_update_chore(name, chore, message=false){
  state.chores[name] = chore
  lambda_call('update_chore', {'name': name, 'chore': chore, 'message': message})
}

function lambda_update_state(new_state){
  state = new_state
  lambda_call('update_state', {'state': state})
}

function lambda_update_user(user, attr, val){
  state.users[user][attr] = val
  lambda_call('update_user', {'user': user, 'attr': attr, 'val': val})
}

function lambda_remind_chore(name){
  lambda_call('remind_chore', {'name':name})
}

// ------------------------------------------------------------------ //