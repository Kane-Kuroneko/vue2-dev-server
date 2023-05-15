<template>
	<div>
		<table :style = "`backgroundColor:${winner ? 'gray': 'aqua'}`" >
			<tbody>
				<tr v-for='(row,y) in checkerboard'>
					<td
						v-for='(mesh,x) in checkerboard[y]'
						@click='place({x,y})'
					> {{ mesh && mesh.description || null }} </td>
				</tr>
			</tbody>
		</table>
		<p v-if='typeof winner === "symbol"'>
			玩家 {{ winner.description }} 是赢家!
		</p>
		<p v-if='winner ==="draw"'>平局!</p>
		<button v-if='winner' @click='play()'>
			{{ winner === true ? "开始游戏" : "再来一盘" }}
		</button>
	</div>
</template>
<script>
import { reaxel_tic_tac_toe } from './reaxel/tic-tac-toe.reaxel';
import { reaxper } from 'reaxes-vue2';

const { place , play,store:store$ticTicToe ,winner } = reaxel_tic_tac_toe();
export default reaxper({
	data(){
		const { checkerboard,store:store$ticTicToe ,winner } = reaxel_tic_tac_toe();
		return {
			checkerboard,
			store$ticTicToe,
			winner,
		}
	},
	methods:{
		place,
		play,
	}
});
</script>
<style scoped>
table {
	width: 150px;
	height: 150px;
	border-collapse: collapse;
}

td {
	width : 50px ;
	height : 50px;
	padding : 0 ;
	border : 1px solid gray;
	text-align : center;
}
</style>
