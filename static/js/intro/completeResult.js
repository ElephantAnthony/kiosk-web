//변수를 지역변수->전역변수로 선언하기로 바꿨어요.(session_storage에서 가져온 값을 db에 저장해야돼서..)
let clickData;
let orderMenu;
let remain_time;
let total_price;
let order;
let accuracy;

window.addEventListener('DOMContentLoaded', function() {
    const clickData = JSON.parse(sessionStorage.getItem("clickData"));
    const orderMenu = JSON.parse(sessionStorage.getItem("orderMenu"));
    const remain_time = parseInt(sessionStorage.getItem("remain_time"));
    const total_price = sessionStorage.getItem("total_price");
    const order = JSON.parse(sessionStorage.getItem("mission"));
    const accuracy = sessionStorage.getItem("accuracy");
    const packaging = sessionStorage.getItem("packaging");
    const paying_time = sessionStorage.getItem("paying-time");
    let time = sessionStorage.getItem('time');

    // 시간 계산
    if ( time ) {
        console.log(time)
        document.querySelector('.using-time').innerHTML = '걸린 시간 : ' + time + '초';
    } else {
        console.log(remain_time, paying_time);
        time = 60 - remain_time + paying_time;
        sessionStorage.setItem('time', time);
        // 정확도 및 시간 출력
        document.querySelector('.accuracy').innerHTML = '정확도 : ' + Math.round(accuracy) + '%';
        document.querySelector('.using-time').innerHTML = '걸린 시간 : ' + time + '초';

        // 주문한 내역 출력
        console.log(orderMenu, order);
        document.querySelector('.ordered-method').innerHTML = '결제 수단 : ' + orderMenu[0].method;
        document.querySelector('.ordered-packaging').innerHTML = '포장 : ' + packaging;

        let result1 = '';
        orderMenu.map((e) => {
            result1 += `
            <div>
                <div>${e.menu_name.split('/')[0]} ${e.quantity}개</div>
                <div>${e.menu_name.split('/')[1] ? e.menu_name.split('/')[1] : '추가 옵션 없음'}</div>
            </div>`;
        })
        document.querySelector('.order-list').innerHTML = result1;
    }
});
