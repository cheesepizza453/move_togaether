'use client';

import React from "react";

const PrivacyText = () => {
    return (
        <div className={'px-[30px] pt-[10px] pb-[30px] text-14-r leading-[1.35]'}>
            <p>
                <strong>무브투개더</strong>(이하 “회사”)는 「개인정보 보호법」 등 관련 법령을 준수하며,
                이용자의 개인정보를 안전하게 처리하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제1조 (개인정보의 수집 항목 및 수집 방법)</h2>
                <p>회사는 회원가입 및 서비스 이용 과정에서 아래와 같은 개인정보를 수집합니다.</p>
                <ul>
                    <li><strong>수집 항목</strong>: 이름, 전화번호, 이메일 주소, 프로필 사진</li>
                    <li><strong>수집 방법</strong>: 홈페이지 회원가입 시 수집 및 및 서비스 이용 중 이용자가 직접 입력</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
                <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
                <ul>
                    <li>회원 가입 및 회원 관리</li>
                    <li>서비스 제공 및 이용자 식별</li>
                    <li>서비스 관련 공지사항 전달 및 문의 대응</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
                <ul>
                    <li>회사는 이용자가 회원 탈퇴를 요청하거나 개인정보의 수집 및 이용 목적이 달성된 경우, 해당 정보를 지체 없이 파기합니다.</li>
                    <li>다만, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제4조 (개인정보의 제3자 제공)</h2>
                <ul>
                    <li>회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.</li>
                    <li>다만, 법령에 따른 요청이 있는 경우 등 예외적으로 관련 법령이 허용하는 범위 내에서 제공될 수 있습니다.</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제5조 (개인정보의 파기 절차 및 방법)</h2>
                <ul>
                    <li>개인정보의 보유기간이 경과하거나 처리 목적이 달성된 경우, 회사는 해당 정보를 지체 없이 파기합니다.</li>
                    <li>전자적 파일 형태의 정보는 복구 및 재생이 불가능한 방법으로 삭제하며, 종이 문서 형태의 정보는 분쇄하거나 소각하여 파기합니다.</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제6조 (이용자의 권리와 행사 방법)</h2>
                <ul>
                    <li>이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</li>
                    <li>개인정보 열람, 정정, 삭제 요청은 서비스 내 문의 기능 또는 아래 기재된 이메일을 통해 요청할 수 있습니다.</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제7조 (개인정보 보호책임자)</h2>
                <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 관련 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <ul>
                    <li><strong>개인정보 보호책임자</strong>: 김미리</li>
                    <li><strong>이메일</strong>: earlykim@grader.kr</li>
                </ul>
            </div>

            <div className="section mt-[20px] pt-[20px] border-t border-gray-200">
                <h2>제8조 (개인정보 처리방침의 변경)</h2>
                <ul>
                    <li>본 개인정보 처리방침은 관련 법령, 정책 또는 보안 기술의 변경에 따라 수정될 수 있습니다.</li>
                    <li>중요한 내용의 변경이 있을 경우, 변경 사항을 시행일 7일 전부터 서비스 내 공지사항 등을 통해 안내합니다.</li>
                </ul>
            </div>

            <p className="date">본 개인정보 처리방침은 <strong>2025년 11월 10일</strong>부터 시행됩니다.</p>

        </div>
    );
};

export default PrivacyText;
