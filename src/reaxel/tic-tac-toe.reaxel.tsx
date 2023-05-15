const symbolX = Symbol( "X" );
const symbolO = Symbol( "O" );

export const reaxel_tic_tac_toe = reaxel( () => {
	const initial = {
		turn : symbolX ,
		checkerboard : [
			[ null , null , null ] ,
			[ null , null , null ] ,
			[ null , null , null ] ,
		] as Array<Array<symbol>> ,
		/*null代表正在对局,未分胜负;true代表不存在上一把对局*/
		winner : true as symbol | boolean | "draw" ,
		winLine : [] ,
	};
	const { store , setState } = orzMobx( initial );
	
	/*每下完一步棋自动检查是否存在赢家*/
	Reaxes.obsReaction(
		() => {
			let loopCount = 0;
			if( store.winner ) {
				return;
			}
			/*棋手交换之前的玩家方,turn代表交换后该谁下棋,所以这里取反拿到上一次的棋手*/
			let player = store.turn === symbolX ? symbolO : symbolX;
			/*查询初始坐标*/
			let x = 0 ,
				y = 0;
			const { checkerboard } = store;
			/*右,右下,下,左下查找*/
			while( x < 2 || y < 2 ){
				loopCount++;
				if( checkerboard[y][x] === player ) {
					let _x1 = x ,
						_y1 = y ,
						_x2 = x ,
						_y2 = y;
					/*向右查找*/
					const row =
						player === checkerboard[y]?.[x + 1] &&
						player === checkerboard[y]?.[x + 2];
					/*右下查找*/
					const slash =
						player === checkerboard[y + 1]?.[x + 1] &&
						player === checkerboard[y + 2]?.[x + 2];
					/*左下查找*/
					const bslash =
						player === checkerboard[y + 1]?.[x - 1] &&
						player === checkerboard[y + 2]?.[x - 2];
					/*向下查找*/
					const down =
						player === checkerboard[y + 1]?.[x] &&
						player === checkerboard[y + 2]?.[x];
					
					switch( true ) {
						case row: {
							_x1 = x + 1;
							_x2 = x + 2;
						}
							break;
						case slash: {
							_x1 = x + 1;
							_y1 = y + 1;
							_x2 = x + 2;
							_y2 = y + 2;
						}
							break;
						case bslash: {
							_x1 = x - 1;
							_y1 = y + 1;
							_x2 = x - 2;
							_y2 = y + 2;
						}
							break;
						case down: {
							_y1 = y + 1;
							_y2 = y + 2;
						}
							break;
					}
					/*某方胜利*/
					if( row || slash || bslash || down ) {
						setState( {
							winner : player ,
							winLine : [
								{ x , y } ,
								{ x : _x1 , y : _y1 } ,
								{ x : _x2 , y : _y2 } ,
							] ,
						} );
						return;
					} else {
						x < 2 ? x++ : ( y++, ( x = 0 ) );
					}
				} else {
					x < 2 ? x++ : ( y++, ( x = 0 ) );
				}
				crayon.green( "x,y:" , x , "," + y );
				if( loopCount > 500 ) {
					throw "您可能陷入了死循环";
				}
			}
			/*如果此时已经找到赢家,就不会继续往下走了*/
			console.log( store.checkerboard.flat() );
			/*平局*/
			if( store.checkerboard.flat().every( ( piece ) => typeof piece === "symbol" ) ) {
				setState( { winner : "draw" } );
				return;
			}
		} ,
		() => [ store.turn ] ,
	);
	
	/*落子*/
	const place = action( ( { x , y } ) => {
		if( store.winner ) {
			return;
		}
		/*如果这个位置已经下过了就不能再下*/
		if( store.checkerboard[y][x] ) {
			return;
		}
		store.checkerboard[y][x] = store.turn;
		setState( { turn : store.turn === symbolX ? symbolO : symbolX } );
	} );
	
	const returning = {
		store ,
		get checkerboard() {
			return store.checkerboard;
		} ,
		/*放置棋子*/
		place ,
		/*重新开始一局*/
		play() {
			setState( {
				...initial ,
				winner : null ,
			} );
		} ,
		get turn() {
			return store.turn;
		} ,
		get winner() {
			return store.winner;
		} ,
	};
	
	return () => {
		return returning;
	};
} );

import { action } from "mobx";
import { crayon } from "reaxes-utils";
import { orzMobx , Reaxes , reaxel } from "reaxes";
